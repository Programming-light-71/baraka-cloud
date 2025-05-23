import { vitePlugin as remix } from "@remix-run/dev";
import { flatRoutes } from "remix-flat-routes";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
      routes(defineRoutes) {
        return flatRoutes("routes", defineRoutes, {
          ignoredRouteFiles: ["**/.*"],
        });
      },
    }),
    tsconfigPaths(),
  ],
  build: {
    target: 'esnext',
    minify: true,
    rollupOptions: {
      output: {
        format: 'esm',
        manualChunks: undefined
      }
    },
    sourcemap: true,
    ssr: {
      noExternal: true
    }
  },
  server: {
    hmr: true
  }
});
