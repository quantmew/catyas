import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isWeb = mode === 'web'

  return {
    plugins: [
      react(),
      // Only load electron plugins in electron mode
      ...(!isWeb ? [
        electron([
      {
        entry: 'electron/main.ts',
        onstart(args) {
          // Kill existing electron process before starting new one
          if (args.startup) {
            args.startup()
          }
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron', 'mysql2', 'pg', 'mongodb', 'redis', 'tedious', 'oracledb', 'better-sqlite3', 'mariadb'],
              input: {
                main: 'electron/main.ts'
              }
            }
          }
        }
      },
      {
        entry: 'electron/preload.cjs',
        onstart(args) {
          // Reload renderer after preload changes
          args.reload()
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron'],
              output: {
                format: 'cjs',
                entryFileNames: 'preload.cjs'
              }
            }
          }
        }
      }
        ]),
        renderer()
      ] : [])
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src')
      }
    },
    server: {
      port: 5173
    },
    define: {
      __IS_WEB__: isWeb
    }
  }
})