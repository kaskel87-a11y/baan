import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/** Chrome on iPhone ignores a relative apple-touch-icon and draws a letter. Keep these root-absolute. */
function absoluteHomeIcons(): Plugin {
  const links = [
    '<link rel="icon" type="image/png" sizes="192x192" href="/baan/icon-192.png" />',
    '<link rel="icon" type="image/png" sizes="512x512" href="/baan/icon-512.png" />',
    '<link rel="apple-touch-icon" href="/baan/apple-touch-icon.png" />',
    '<link rel="apple-touch-icon" sizes="180x180" href="/baan/apple-touch-icon.png" />',
    '<link rel="apple-touch-icon-precomposed" href="/baan/apple-touch-icon.png" />',
    '<link rel="apple-touch-icon-precomposed" sizes="180x180" href="/baan/apple-touch-icon.png" />',
    '<link rel="manifest" href="/baan/manifest.webmanifest" />',
  ];
  return {
    name: "absolute-home-icons",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        const stripped = html
          .replace(/\s*<link rel="icon"[^>]*>/g, "")
          .replace(/\s*<link rel="apple-touch-icon(?:-precomposed)?"[^>]*>/g, "")
          .replace(/\s*<link rel="manifest"[^>]*>/g, "");
        return stripped.replace("</head>", `    ${links.join("\n    ")}\n    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />\n  </head>`);
      },
    },
  };
}

// base "./" so the static build works from any path or host.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), absoluteHomeIcons()],
});
