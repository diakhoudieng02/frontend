import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 8080,
    allowedHosts: [
      'wheezy-tom-ambidextrously.ngrok-free.dev'
    ],
    hmr: {
      overlay: false,
    },
  },

  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  optimizeDeps: {
    include: ['react-webcam'],
    exclude: [],
    force: true,
  },

  build: {
    // Vide dist/ à chaque build (évite les fichiers orphelins)
    emptyOutDir: true,

    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },

    // ✅ Cache Busting : hash unique dans chaque nom de fichier
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',

        // Sépare vendors (React, libs) du code applicatif
        // → les libs cachées longtemps, ton code re-téléchargé à chaque deploy
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
  },

  cacheDir: 'node_modules/.vite',
}));