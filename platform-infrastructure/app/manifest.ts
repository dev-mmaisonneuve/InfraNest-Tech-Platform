import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "InfraNest Technologies",
    short_name: "InfraNest",
    description:
      "Managed IT operations, cloud infrastructure, and responsive technology support for small businesses.",
    start_url: "/",
    display: "browser",
    // The fixed header's dark surface; Android tints its UI with this.
    theme_color: "#050b16",
    background_color: "#eef3fb",
    icons: [
      { src: "/assets/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/assets/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
