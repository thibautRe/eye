import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin"

export default defineConfig({
  plugins: [vanillaExtractPlugin(), solidPlugin()],
  build: { target: "esnext" },
  server: {
    proxy: { "/api": { target: "http://localhost:5748" } },
    port: 5750,
  },
})
