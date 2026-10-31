import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    css: false,
    // Form-heavy page tests (MUI + react-hook-form) are slow under coverage and on CI runners.
    testTimeout: 20_000,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/__tests__/**',
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/**/types.ts',
        'src/**/*.types.ts',
        'src/types/**',
      ],
      // Ratchet toward the 95% target: local runs raise these to the new floor
      // (commit the change); CI only enforces them.
      thresholds: {
        statements: 48,
        branches: 44,
        functions: 44,
        lines: 49,
        autoUpdate: process.env.CI ? false : (newThreshold) => Math.floor(newThreshold),
      },
    },
  },
});
