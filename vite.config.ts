
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // Serve from the root since Nginx is configured for `/`
  build: {
    outDir: 'dist', // Ensure output directory matches Nginx config
    emptyOutDir: true, // Clear the output directory before building
  },
  plugins: [
    react(),
  ],
  resolve:{
    alias:{
      '@' : path.resolve(__dirname,"./src")
    }
  }
});
