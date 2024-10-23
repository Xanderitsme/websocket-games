import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { envs } from './src/config/envs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  build: {
    outDir: '../server/client-build',
    emptyOutDir: true
  },
  server: {
    port: envs.CLIENT_PORT
  }
})
