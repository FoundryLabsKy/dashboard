import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Set by the Pages deploy workflow (e.g. "/dashboard/spending-tracker/"); "/" locally.
  base: process.env.SPENDING_TRACKER_BASE || "/",
  plugins: [react(), tailwindcss()],
});
