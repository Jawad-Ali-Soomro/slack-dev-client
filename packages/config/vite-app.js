import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const monorepoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
)

/**
 * Shared Vite config factory for all frontend apps.
 * @param {{ port: number, appName?: string }} options
 */
export function createAppViteConfig({ port, appName = 'app' }) {
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port,
      strictPort: true,
      fs: {
        allow: [monorepoRoot],
      },
    },
    preview: {
      port,
      strictPort: true,
    },
    resolve: {
      dedupe: ['react', 'react-dom', 'react-router-dom'],
      alias: {
        '@': path.resolve(process.cwd(), 'src'),
        '@multi-tenants/config': path.resolve(monorepoRoot, 'packages/config/src'),
        '@multi-tenants/api': path.resolve(monorepoRoot, 'packages/api/src'),
        '@multi-tenants/auth': path.resolve(monorepoRoot, 'packages/auth/src'),
        '@multi-tenants/hooks': path.resolve(monorepoRoot, 'packages/hooks/src'),
        '@multi-tenants/utils': path.resolve(monorepoRoot, 'packages/utils/src'),
        '@multi-tenants/types': path.resolve(monorepoRoot, 'packages/types/src'),
        '@multi-tenants/constants': path.resolve(
          monorepoRoot,
          'packages/constants/src',
        ),
        '@multi-tenants/ui/styles.css': path.resolve(
          monorepoRoot,
          'packages/ui/src/styles/globals.css',
        ),
        '@multi-tenants/ui': path.resolve(monorepoRoot, 'packages/ui/src'),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'react-icons'],
    },
    define: {
      __APP_NAME__: JSON.stringify(appName),
    },
  }
}
