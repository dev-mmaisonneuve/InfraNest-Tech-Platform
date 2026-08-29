import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { brandAssets } from "@/lib/brand-assets";

const logoDataUri = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public", "assets", "Infra-logo.png"),
).toString("base64")}`;

export const alt = "InfraNest Technologies managed IT and cloud support";
export const size = {
  width: brandAssets.socialPreview.width,
  height: brandAssets.socialPreview.height,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #081321 0%, #0d1f35 48%, #123556 100%)",
          color: "#f6fbff",
          padding: "54px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            borderRadius: "32px",
            border: "1px solid rgba(255,255,255,0.12)",
            background:
              "linear-gradient(160deg, rgba(255,255,255,0.11), rgba(255,255,255,0.05))",
            boxShadow: "0 24px 64px rgba(2, 10, 22, 0.35)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "100%",
              padding: "44px 48px",
              background:
                "radial-gradient(circle at top right, rgba(18, 135, 208, 0.24), transparent 34%)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "26px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  color: "#8fddb9",
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    background:
                      "linear-gradient(135deg, #65b6ff 0%, #8fddb9 100%)",
                  }}
                />
                Managed IT operations and cloud support
              </div>
              <img
                src={logoDataUri}
                width={520}
                height={200}
                alt="InfraNest Technologies"
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: 60,
                    lineHeight: 1.03,
                    fontWeight: 800,
                    maxWidth: 760,
                  }}
                >
                  Reliable systems, calmer operations, and support that scales with the business.
                </div>
                <div
                  style={{
                    fontSize: 28,
                    lineHeight: 1.4,
                    color: "rgba(246, 251, 255, 0.82)",
                    maxWidth: 860,
                  }}
                >
                  Managed IT operations, cloud platform support, SaaS administration, and responsive business technology guidance.
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  color: "#d8ecff",
                  fontSize: 24,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 999,
                    padding: "10px 16px",
                    background: "rgba(255,255,255,0.08)",
                  }}
                >
                  Managed IT operations
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 999,
                    padding: "10px 16px",
                    background: "rgba(255,255,255,0.08)",
                  }}
                >
                  Cloud support
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 999,
                    padding: "10px 16px",
                    background: "rgba(255,255,255,0.08)",
                  }}
                >
                  SaaS administration
                </div>
              </div>
              <div
                style={{
                  color: "#65b6ff",
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                InfraNest Technologies
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
