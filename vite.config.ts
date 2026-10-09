import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { sentinelApiPlugin } from './server/vite-plugin.ts'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sentinelApiPlugin()],
})

