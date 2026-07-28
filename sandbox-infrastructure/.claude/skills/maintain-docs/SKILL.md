---
name: maintain-docs
description: Review and rewrite CLAUDE.md and README.md in this project to keep them clean, consistent, and non-redundant. Use when asked to clean up, trim, audit, or sync this project's documentation, or after changes that would make either file stale.
---

# Maintain docs

Keeps `sandbox-infrastructure/CLAUDE.md` and `sandbox-infrastructure/README.md` clean, aligned, and free of redundant or stale content. Run this whenever asked to audit, trim, or sync this project's docs — or proactively after a change big enough to make either file stale (new route, new env var, renamed directory, etc).

## Files in scope

- `sandbox-infrastructure/CLAUDE.md` — agent-facing, high priority
- `sandbox-infrastructure/README.md` — human-facing

Do not touch the repo-root `README.md` or the asset-folder READMEs (`assets/README.md`, `public/assets/README.md`) — those are out of scope for this skill.

## Step 1 — Read both files and the current codebase

Read both files in full. Skim the actual project state relevant to any claim being kept or added (`package.json` scripts, `app/` routes, `.env.example`, key `lib/`/`components/` files) so nothing stale gets carried forward or written fresh. Never invent structure — every fact in the output must be verifiable against the repo as it stands right now.

## Step 2 — Rewrite CLAUDE.md (aggressive trim)

CLAUDE.md is loaded into every session in this directory, so its token cost is real and recurring. Optimize hard for signal-per-line.

- Keep: architecture in one or two sentences, request/data flow, key directories and what lives in each, real gotchas (sync-two-arrays traps, ordering constraints, non-obvious behavior), commands, env var names, testing command.
- Cut: anything a reader could get by opening the file itself, marketing copy or content enumerations that live in data files, restated facts (say each thing exactly once, in the section it most belongs to), full explanations where a short bullet does the job, a "quick reference" table that just repeats the rest of the file in table form.
- Prefer compact bullets and tables over prose paragraphs.
- If two sections would state the same fact, keep it in the more specific section and drop the other, don't duplicate.
- Do not remove information that isn't recoverable elsewhere (e.g. a subtle bug trap, a required manual step, a non-default config quirk) — trim the words, not the facts.

## Step 3 — Rewrite README.md (clarity, not brevity)

README.md is for humans setting up or evaluating the project. Some redundancy with CLAUDE.md is fine here if it helps a first-time reader (e.g. restating the stack or setup steps is OK even though CLAUDE.md also mentions them).

- Keep/improve: what the project is, stack, local setup steps, commands, required env vars, how to run tests, how to deploy/apply DB schema if relevant.
- Rewrite messy or out-of-date sections instead of patching around them.
- Keep headings and table structure clean and scannable.

## Step 4 — Consistency check

- Cross-check both files for contradictions (different commands, different env var names, different architecture claims) — resolve in favor of what's actually true in the codebase.
- CLAUDE.md must remain the distilled version; README.md may expand on the same facts but must not conflict.
- Don't invent new duplication when editing — if a fact is being added to one file and it's genuinely new, check whether it belongs in the other file too before leaving it in only one.

## Step 5 — Output

- Apply the edits directly to both files.
- Report back concisely: for CLAUDE.md, list what was removed or merged and why (one line each); for README.md, summarize what was rewritten or reorganized.
- Do not make noisy changes (no pure reformatting, no reordering sections without reason) — every diff should be justified by the rules above.
