import { createLibraryConfig } from "@brick/vite-config/library";

export default createLibraryConfig({
  pkgDir: import.meta.dirname,
  entry: {
    index: "src/index.ts",
    styles: "src/styles.ts",
  },
  cssFileName: "styles",
});
