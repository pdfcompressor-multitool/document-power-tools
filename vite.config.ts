import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  // IMPORTANT: repo name here
  base: "/document-power-tools/",

  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),

  server: {
    host: "::",
    port: 8080,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Force single React instance to prevent duplicate React errors
    dedupe: ["react", "react-dom"],
  },

  build: {
    outDir: "dist",
  },

  optimizeDeps: {
    // Force re-bundling of dependencies to clear stale cache
    force: true,
  },
}));
