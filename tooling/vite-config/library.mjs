import { createRequire } from "node:module";
import { resolve } from "node:path";

import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { preserveDirectives } from "rollup-plugin-preserve-directives";

/**
 * 배포용 라이브러리 패키지의 공통 Vite 설정.
 *
 * 설계 의도:
 * - preserveModules: 소비 측 번들러가 트리셰이킹할 수 있도록 파일 구조를 보존한다.
 *   단일 번들로 말면 Text 하나 쓰는데 전체 컴포넌트가 딸려간다.
 * - .d.ts 는 여기서 만들지 않는다. TypeScript 7 은 클래식 컴파일러 API 를 노출하지
 *   않아 vite-plugin-dts 계열을 쓸 수 없다. 각 패키지의 build 스크립트에서
 *   `tsc --emitDeclarationOnly` 로 별도 생성한다.
 * - dependencies / peerDependencies 는 전부 external 처리한다. 번들에 포함하면
 *   소비 프로젝트에서 React 가 중복 로드되는 등의 사고가 난다.
 *
 * @param {object} options
 * @param {string} options.pkgDir 패키지 루트 절대경로 (보통 import.meta.dirname)
 * @param {string | Record<string, string>} [options.entry] 엔트리. 여러 개면
 *   `{ index: "src/index.ts", theme: "src/theme.ts" }` 형태로 준다. 기본값 "src/index.ts"
 * @param {string} [options.cssFileName] 산출 CSS 파일명(확장자 제외). 기본값 "styles"
 * @param {(string | RegExp)[]} [options.extraExternal] 추가로 external 처리할 모듈
 * @returns {import("vite").UserConfig}
 */
export function createLibraryConfig({
  pkgDir,
  entry = "src/index.ts",
  cssFileName = "styles",
  extraExternal = [],
}) {
  const require = createRequire(import.meta.url);
  /** @type {{ dependencies?: Record<string, string>, peerDependencies?: Record<string, string> }} */
  const pkg = require(resolve(pkgDir, "package.json"));

  const externalNames = [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
  ];

  /** 정확히 그 패키지이거나 그 하위 경로(`react/jsx-runtime` 등)면 external */
  const external = [
    ...externalNames.map((name) => new RegExp(`^${escapeRegExp(name)}(/.*)?$`)),
    ...extraExternal,
  ];

  /** @type {import("rollup").OutputOptions} */
  const sharedOutput = {
    dir: "dist",
    preserveModules: true,
    preserveModulesRoot: "src",
    assetFileNames: "[name][extname]",
  };

  return {
    plugins: [vanillaExtractPlugin(), preserveDirectives()],
    build: {
      outDir: "dist",
      emptyOutDir: true,
      sourcemap: true,
      minify: false, // 라이브러리는 압축하지 않는다. 소비 측 번들러가 한다.
      lib: {
        entry:
          typeof entry === "string"
            ? resolve(pkgDir, entry)
            : Object.fromEntries(
                Object.entries(entry).map(([name, path]) => [name, resolve(pkgDir, path)]),
              ),
        formats: ["es", "cjs"],
        cssFileName,
      },
      rollupOptions: {
        external,
        output: [
          { ...sharedOutput, format: "es", entryFileNames: "[name].js" },
          { ...sharedOutput, format: "cjs", entryFileNames: "[name].cjs", exports: "named" },
        ],
        onwarn(warning, warn) {
          // "use client" 지시어를 보존할 때 나는 소음. preserveDirectives 가 처리한다.
          if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
          warn(warning);
        },
      },
    },
  };
}

/** @param {string} value */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
