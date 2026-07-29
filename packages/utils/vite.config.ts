import { createLibraryConfig } from "@brick/vite-config/library";

export default createLibraryConfig({
  pkgDir: import.meta.dirname,
  // react/jsx-runtime 은 peerDependencies 의 "react" 하위 경로라 자동으로 external 이 된다.
});
