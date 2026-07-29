import type { UserConfig } from "vite";

export interface CreateLibraryConfigOptions {
  /** 패키지 루트 절대경로 (보통 `import.meta.dirname`) */
  pkgDir: string;
  /** 엔트리 파일. 기본값 `"src/index.ts"` */
  entry?: string;
  /** 산출 CSS 파일명(확장자 제외). 기본값 `"styles"` */
  cssFileName?: string;
  /** 추가로 external 처리할 모듈 */
  extraExternal?: (string | RegExp)[];
}

export declare function createLibraryConfig(options: CreateLibraryConfigOptions): UserConfig;
