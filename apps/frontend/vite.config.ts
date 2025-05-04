/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { resolve } from "path";

export default defineConfig(() => {
  return {
    plugins: [nodePolyfills(), react()],
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        external: [],
      },
      // Skip packages directory
      emptyOutDir: false,
    },
    resolve: {
      alias: {
        '../../packages': resolve(__dirname, '../../packages'),
        // Ensure consistent React versions
        'react': resolve(__dirname, 'node_modules/react'),
        'react-dom': resolve(__dirname, 'node_modules/react-dom')
      },
      dedupe: ['react', 'react-dom']
    },
    optimizeDeps: {
      include: ['lodash', 'bignumber.js', '@vechain/picasso', 'react', 'react-dom']
    },
    preview: {
      port: 5001,
      strictPort: true,
    },
    server: {
      port: 5001,
      strictPort: true,
      host: true,
      origin: "http://0.0.0.0:5001",
    },
    //vitest
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: [
        resolve(__dirname, "test/setup/setup.ts"),
        resolve(__dirname, "test/setup/resizeObserverMock.ts"),
      ],
    },
  };
});
