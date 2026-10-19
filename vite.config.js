import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 300,
    },
    hmr: {
      clientPort: 5173,
    },
    proxy: {
      "/agent": {
        target: process.env.AGENT_PROXY_TARGET || "http://127.0.0.1:5055",
        changeOrigin: true,
        rewrite: (proxyPath) => proxyPath.replace(/^\/agent/, ""),
      },
    },
  },
});
