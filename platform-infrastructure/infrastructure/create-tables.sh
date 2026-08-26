#!/usr/bin/env bash
#
# Provisions the two DynamoDB tables the form endpoints write to.
#
# Replaces the old supabase/schema.sql. Like that file, this is applied by hand —
# committing a change here does nothing on its own.
#
# The key design matters: `email` as the partition key and `created_at` as the
# sort key is what makes the duplicate-submission check in lib/submissions.ts a
# bounded range query against a single partition instead of a table scan.
#
# Usage: ./infrastructure/create-tables.sh [region]

set -euo pipefail

REGION="${1:-us-east-1}"
LEADS_TABLE="${LEADS_TABLE_NAME:-infranest-leads}"
QUOTES_TABLE="${QUOTE_REQUESTS_TABLE_NAME:-infranest-quote-requests}"

create_table() {
  local table_name="$1"

  if aws dynamodb describe-table --table-name "$table_name" --region "$REGION" >/dev/null 2>&1; then
    echo "Table $table_name already exists in $REGION — skipping."
    return
  fi

  echo "Creating $table_name in $REGION..."
  aws dynamodb create-table \
    --table-name "$table_name" \
    --region "$REGION" \
    --attribute-definitions \
      AttributeName=email,AttributeType=S \
      AttributeName=created_at,AttributeType=S \
    --key-schema \
      AttributeName=email,KeyType=HASH \
      AttributeName=created_at,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --tags Key=project,Value=infranest-web

  aws dynamodb wait table-exists --table-name "$table_name" --region "$REGION"

  # Leads are business records. Point-in-time recovery is a few cents a month at
  # this volume and is the difference between a bad afternoon and a lost pipeline.
  aws dynamodb update-continuous-backups \
    --table-name "$table_name" \
    --region "$REGION" \
    --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true

  echo "Created $table_name with point-in-time recovery enabled."
}

create_table "$LEADS_TABLE"
create_table "$QUOTES_TABLE"

echo
echo "Done. Set these in the Amplify environment:"
echo "  LEADS_TABLE_NAME=$LEADS_TABLE"
echo "  QUOTE_REQUESTS_TABLE_NAME=$QUOTES_TABLE"
