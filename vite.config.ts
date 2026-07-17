import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_BASE_URL;

  return {
    plugins: [react()],
    server: {
      host: true,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
      tsconfigPaths: true,
    },
    build: {
      chunkSizeWarningLimit: 600,
      rolldownOptions: {
        output: {
          manualChunks: (id: string) => {
            if (!id.includes('node_modules')) return;
            if (id.includes('react/') || id.includes('react-dom') || id.includes('react-router'))
              return 'vendor-react';
            if (
              id.includes('@reduxjs') ||
              id.includes('react-redux') ||
              id.includes('reselect') ||
              id.includes('/redux/') ||
              id.includes('/immer/')
            )
              return 'vendor-redux';
            if (id.includes('@tanstack')) return 'vendor-table';
            if (id.includes('@emotion') || id.includes('@mui')) return 'vendor-mui';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (
              id.includes('react-hook-form') ||
              id.includes('@hookform') ||
              id.includes('/zod/') ||
              id.includes('mui-schema-form-builder')
            )
              return 'vendor-forms';
            if (id.includes('react-easy-crop') || id.includes('react-hot-toast'))
              return 'vendor-ui-ext';
            if (id.includes('axios') || id.includes('async-mutex') || id.includes('dayjs'))
              return 'vendor-utils';
            return 'vendor-misc';
          },
        },
      },
    },
  };
});

export default config;
