import { defineConfig } from 'vite'
import { createAppViteConfig } from '../../packages/config/vite-app.js'

export default defineConfig(
  createAppViteConfig({ port: 5000, appName: 'superadmin' }),
)
