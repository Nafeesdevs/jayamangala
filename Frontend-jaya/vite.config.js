import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom") || id.includes("node_modules/react-router-dom")) {
            return "vendor-react";
          }
          // UI + icons
          if (id.includes("node_modules/lucide-react") || id.includes("node_modules/react-hot-toast")) {
            return "vendor-ui";
          }
          // HTTP client
          if (id.includes("node_modules/axios")) {
            return "vendor-http";
          }
          // Admin pages — loaded only by admins
          if (id.includes("/pages/admin/")) {
            return "chunk-admin";
          }
        },
      },
    },
  },
});
