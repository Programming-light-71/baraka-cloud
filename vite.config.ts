import { vitePlugin as remix } from "@remix-run/dev";
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
        return defineRoutes((route) => {
          route("drive", "routes/drive/route.tsx", () => {
            route("", "routes/drive/_index/route.tsx", { index: true }); // Default content for `/drive`
            route("request-files", "routes/drive/request-files/route.tsx"); // `/drive/request-files `
            route("shared-files", "routes/drive/shared-files/route.tsx"); // `/drive/shared-files`
            route("starred", "routes/drive/starred.tsx"); // `/drive/shared-files`
            route("trash", "routes/drive/trash/route.tsx"); // `/drive/trash`
            route("task", "routes/drive/task/route.tsx"); // `/drive/trash`
            route("statistics", "routes/drive/statistics.tsx"); // `/drive/trash`
          });

          route("login", "routes/auth/_auth.tsx", () => {
            route("", "routes/auth/login.tsx", { index: true });
            // route("login", "routes/auth/login.tsx");
            route("otp", "routes/auth/otp.tsx");
          });

          route("api/v1/", "routes/api/route.tsx", () => {
            route("login", "routes/api/auth/login.tsx");
            route("otp", "routes/api/auth/otp.tsx");
          });
        });
      },
    }),
    tsconfigPaths(),
  ],
});
