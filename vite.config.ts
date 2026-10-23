import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      manifest: {
        id: "/",
        name: "ASTERISM — Worldbuilding for Anything",
        short_name: "ASTERISM",
        description: "Worldbuilding for Anything. Um estúdio PlayToSmilles.",
        lang: "pt-BR",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#10131b",
        theme_color: "#10131b",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: [
          "index.html",
          "assets/*.{js,css}",
          "assets/home-wallpaper-*.png",
          "icons/apple-touch-icon.png",
          "icons/tree-logo.png",
        ],
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: false,
        // No runtime cache: user PDFs and remote images never enter the app cache.
        runtimeCaching: [],
      },
    }),
  ],
});
