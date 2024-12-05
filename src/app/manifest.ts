import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Philip Wallis Portfolio",
    short_name: "Philip Wallis",
    description: "Philip Wallis Portfolio",
    start_url: "/",
    display: "standalone",
    background_color: "#192b4a",
    theme_color: "#192b4a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
