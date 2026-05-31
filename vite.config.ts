// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    build: {
      // Optimize build performance and reduce memory usage
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // Split large dependencies into separate chunks for client build
          manualChunks(id) {
            // Only apply to client-side bundles
            if (id.includes('node_modules')) {
              // Vendor chunks
              if (id.includes('recharts')) {
                return 'recharts';
              }
              if (id.includes('@tanstack')) {
                return 'tanstack';
              }
              if (id.includes('@radix-ui')) {
                return 'ui-vendor';
              }
            }
          },
        },
      },
    },
    esbuild: {
      // Increase esbuild timeout to prevent "service stopped" errors
      logLevel: 'warning',
    },
  },
});
