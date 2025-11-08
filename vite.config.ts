import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,      // 👈 allows access from LAN (0.0.0.0)
    port: 5173,      // you can change the port if you like
    strictPort: true // optional: prevents random port fallback
  },
});