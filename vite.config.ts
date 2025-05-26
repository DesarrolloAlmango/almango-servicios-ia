
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::", // Mantener esta configuración
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://app.almango.com.uy',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Establecer encabezados necesarios para evitar problemas de CORS
            proxyReq.setHeader('X-Forwarded-Host', 'localhost');
            proxyReq.setHeader('Origin', 'https://app.almango.com.uy');
            proxyReq.setHeader('Referer', 'https://app.almango.com.uy/');
          });
        }
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
