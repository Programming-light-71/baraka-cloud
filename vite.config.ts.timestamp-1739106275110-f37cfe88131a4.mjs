// vite.config.ts
import { vitePlugin as remix } from "file:///E:/Neshakhor%20Programmer/Programming%20Light/baraka-cloud/node_modules/@remix-run/dev/dist/index.js";
import { flatRoutes } from "file:///E:/Neshakhor%20Programmer/Programming%20Light/baraka-cloud/node_modules/remix-flat-routes/dist/index.js";
import { defineConfig } from "file:///E:/Neshakhor%20Programmer/Programming%20Light/baraka-cloud/node_modules/vite/dist/node/index.js";
import tsconfigPaths from "file:///E:/Neshakhor%20Programmer/Programming%20Light/baraka-cloud/node_modules/vite-tsconfig-paths/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true
      },
      routes(defineRoutes) {
        return flatRoutes("routes", defineRoutes, {
          ignoredRouteFiles: ["**/.*"]
          // Ignore dot files (like .DS_Store)
        });
      }
    }),
    tsconfigPaths()
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxOZXNoYWtob3IgUHJvZ3JhbW1lclxcXFxQcm9ncmFtbWluZyBMaWdodFxcXFxiYXJha2EtY2xvdWRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXE5lc2hha2hvciBQcm9ncmFtbWVyXFxcXFByb2dyYW1taW5nIExpZ2h0XFxcXGJhcmFrYS1jbG91ZFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovTmVzaGFraG9yJTIwUHJvZ3JhbW1lci9Qcm9ncmFtbWluZyUyMExpZ2h0L2JhcmFrYS1jbG91ZC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IHZpdGVQbHVnaW4gYXMgcmVtaXggfSBmcm9tIFwiQHJlbWl4LXJ1bi9kZXZcIjtcclxuaW1wb3J0IHsgZmxhdFJvdXRlcyB9IGZyb20gXCJyZW1peC1mbGF0LXJvdXRlc1wiO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tIFwidml0ZS10c2NvbmZpZy1wYXRoc1wiO1xyXG5cclxuZGVjbGFyZSBtb2R1bGUgXCJAcmVtaXgtcnVuL25vZGVcIiB7XHJcbiAgaW50ZXJmYWNlIEZ1dHVyZSB7XHJcbiAgICB2M19zaW5nbGVGZXRjaDogdHJ1ZTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVtaXgoe1xyXG4gICAgICBmdXR1cmU6IHtcclxuICAgICAgICB2M19mZXRjaGVyUGVyc2lzdDogdHJ1ZSxcclxuICAgICAgICB2M19yZWxhdGl2ZVNwbGF0UGF0aDogdHJ1ZSxcclxuICAgICAgICB2M190aHJvd0Fib3J0UmVhc29uOiB0cnVlLFxyXG4gICAgICAgIHYzX3NpbmdsZUZldGNoOiB0cnVlLFxyXG4gICAgICAgIHYzX2xhenlSb3V0ZURpc2NvdmVyeTogdHJ1ZSxcclxuICAgICAgfSxcclxuXHJcbiAgICAgIHJvdXRlcyhkZWZpbmVSb3V0ZXMpIHtcclxuICAgICAgICByZXR1cm4gZmxhdFJvdXRlcyhcInJvdXRlc1wiLCBkZWZpbmVSb3V0ZXMsIHtcclxuICAgICAgICAgIGlnbm9yZWRSb3V0ZUZpbGVzOiBbXCIqKi8uKlwiXSwgLy8gSWdub3JlIGRvdCBmaWxlcyAobGlrZSAuRFNfU3RvcmUpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuICAgIHRzY29uZmlnUGF0aHMoKSxcclxuICBdLFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFnVyxTQUFTLGNBQWMsYUFBYTtBQUNwWSxTQUFTLGtCQUFrQjtBQUMzQixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLG1CQUFtQjtBQVExQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsTUFDSixRQUFRO0FBQUEsUUFDTixtQkFBbUI7QUFBQSxRQUNuQixzQkFBc0I7QUFBQSxRQUN0QixxQkFBcUI7QUFBQSxRQUNyQixnQkFBZ0I7QUFBQSxRQUNoQix1QkFBdUI7QUFBQSxNQUN6QjtBQUFBLE1BRUEsT0FBTyxjQUFjO0FBQ25CLGVBQU8sV0FBVyxVQUFVLGNBQWM7QUFBQSxVQUN4QyxtQkFBbUIsQ0FBQyxPQUFPO0FBQUE7QUFBQSxRQUM3QixDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0QsY0FBYztBQUFBLEVBQ2hCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
