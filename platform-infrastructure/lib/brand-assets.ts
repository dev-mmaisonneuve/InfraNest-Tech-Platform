/**
 * Runtime-ready assets only. The full-resolution brand masters live in
 * `assets/` at the project root (see assets/README.md) and are deliberately
 * not addressable here: pointing UI code at a 200kB source PNG is how the
 * footer ended up serving one.
 */
export const brandAssets = {
  uiWordmark: {
    src: "/assets/infra-logo-ui.png",
    width: 448,
    height: 172,
  },
  badge: {
    src: "/assets/infra-badge.png",
    width: 425,
    height: 425,
  },
  socialPreview: {
    src: "/opengraph-image",
    width: 1200,
    height: 630,
  },
} as const;
