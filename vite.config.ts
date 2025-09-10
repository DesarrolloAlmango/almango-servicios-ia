import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  // Configuración base
  base: "/",  // Asegúrate de que sea "/" para rutas absolutas

  // Configuración del servidor en desarrollo
  server: {
    host: "::", 
    port: 8080,
    strictPort: true,  // Evita que Vite asigne un puerto aleatorio si el 8080 está ocupado
    proxy: {
      '/api': {
        target: 'https://app.almango.com.uy',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Headers para evitar CORS en desarrollo
            proxyReq.setHeader('X-Forwarded-Host', 'localhost');
            proxyReq.setHeader('Origin', 'https://app.almango.com.uy');
            proxyReq.setHeader('Referer', 'https://app.almango.com.uy/');
          });
        }
      }
    }
  },

  // Plugins (React + Tagger solo en desarrollo)
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),

  // Resolución de alias (para importaciones con "@/")
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Configuración específica para producción
  build: {
    outDir: "dist",  // Carpeta donde se generará el build
    emptyOutDir: true,  // Limpia la carpeta antes de cada build
    sourcemap: mode === "development",  // Sourcemaps solo en desarrollo
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),  // Punto de entrada principal
      },
      output: {
        // Opcional: Para nombres de archivos estáticos sin hash (mejor para caché)
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },

  // Configuración para manejar proxies en producción también
  define: {
    __API_PROXY_TARGET__: JSON.stringify('https://app.almango.com.uy')
  },

  // Precarga de recursos (mejora rendimiento en producción)
  preview: {
    port: 8080,  // Puerto para `vite preview` (simula producción local)
  },
}));