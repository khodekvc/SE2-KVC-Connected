import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: './test/components/setUp/setUpTests.jsx',
    environment: 'jsdom',
  },
});