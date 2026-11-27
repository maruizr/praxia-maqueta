import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Praxia · Gestión en terreno",
    short_name: "Praxia",
    lang: "es-CL",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f8f6",
    theme_color: "#147452",
    icons: [
      { src: "/praxia-192.png", sizes: "192x192", type: "image/png" },
      { src: "/praxia-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/praxia-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
