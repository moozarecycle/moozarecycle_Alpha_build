import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),tailwindcss(),
  ],
  build: {
    // Increase the warning limit slightly to reduce noise (optional)
    chunkSizeWarningLimit: 500, 
    rollupOptions: {
      output: {
        // This function tells Vite how to group modules into chunks
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Put Firebase code in its own file
            if (id.includes('firebase')) {
              return 'firebase';
            }
            // Put Icon code in its own file (Lucide is heavy!)
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            // Put React and other core stuff in a 'vendor' file
            return 'vendor';
          }
        },
      },
    },
  },
});