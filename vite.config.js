import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Custom Rollup plugin to preserve directives
const preserveDirectives = () => {
  return {
    name: 'preserve-directives',
    transform(code, id) {
      if (id.includes('client/src')) {
        // Logic to preserve "use client" directives
        // This might involve modifying the code to keep the directive
        return { code };
      }
      return null;
    },
  };
};

export default defineConfig({
  root: 'client', // Set 'client' as the root directory
  plugins: [react(), preserveDirectives()],
  build: {
    outDir: '../dist', // Output in root-level 'dist'
    sourcemap: false, // Disable source maps in production
    rollupOptions: {
      input: 'client/index.html', // Ensure the correct entry file
      external: ['@fortawesome/free-solid-svg-icons'], // Add Font Awesome to external
    },
  },
  server: {
    port: 3000, // Adjust as needed
  },
  resolve: {
    alias: {
      '@': '/src', // Optional: alias for cleaner imports
    },
  },
});
