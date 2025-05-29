import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: "/",  // Asegura que las rutas se resuelvan desde la raíz
  server: {
    host: "::",
    port: 8080,
    // Habilita historyApiFallback en desarrollo (para rutas como /servicios)
    historyApiFallback: {
      disableDotRule: true,  // Permite rutas con puntos (ej. /servicios.html)
      rewrites: [
        { from: /^\/servicios/, to: '/index.html' },  // Redirige /servicios a index.html
      ],
    },
    proxy: {
      '/api': {
        target: 'https://app.almango.com.uy',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
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
  // Configuración adicional para producción (opcional)
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
  },
}));