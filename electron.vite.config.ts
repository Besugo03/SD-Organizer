import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import csp from 'vite-plugin-csp'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react(), csp()]
  }
})
