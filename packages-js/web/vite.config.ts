import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'

export default defineConfig({
  plugins: [vanillaExtractPlugin(), solidPlugin()],
  build: {
    target: 'esnext',
    polyfillDynamicImport: false,
  },
})
