# brick-ui Monorepo 아키텍처 설계

> HTML 기본 태그를 유틸리티 CSS가 온전히 적용된 상태로 래핑한 **Primitive 컴포넌트 라이브러리**.
> 당근 [SEED](https://seed-design.io)의 구조적 접근을 참고합니다.

## 목차

- [0. 기술 스택 결정](#0-기술-스택-결정)
- [1. 전체 폴더 구조](#1-전체-폴더-구조)
- [2. 각 패키지의 역할](#2-각-패키지의-역할)
- [3. package.json 설정 방향](#3-packagejson-설정-방향)
- [4. turbo.json](#4-turbojson)
- [5. 배포 전 반드시 정리해야 할 것](#5-배포-전-반드시-정리해야-할-것)
- [6. FSD 프로젝트에서의 소비 형태](#6-fsd-프로젝트에서의-소비-형태)
- [7. 구축 순서](#7-구축-순서)

---

## 0. 기술 스택 결정

| 항목                | 선택                                      | 사유                                                                                                               |
| ------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 패키지 매니저       | pnpm workspace (v11)                      | catalog로 의존성 버전 중앙 관리                                                                                    |
| 빌드 오케스트레이션 | Turborepo v2                              | 패키지 간 빌드 순서 의존성 해결 + 캐싱                                                                             |
| 컴포넌트            | React 19.2, TypeScript 7.0                | —                                                                                                                  |
| 스타일링            | **Vanilla Extract**                       | 제로 런타임. 빌드 시 CSS 파일이 산출되므로 소비 프로젝트의 빌드 설정에 의존하지 않음 → 배포 라이브러리로 가장 안전 |
| 린트                | **oxlint + oxlint-tsgolint**              | TypeScript 7 대응 (아래 참고). typescript-eslint 는 사용 불가                                                      |
| 타입 선언 생성      | **`tsc --emitDeclarationOnly`**           | 동일 이유로 vite-plugin-dts 계열 사용 불가                                                                         |
| 문서                | Storybook(개발) + Next.js(공개 문서) 병행 | 컴포넌트 격리 개발 환경과 공개 문서를 분리                                                                         |
| 패키지 분할         | core / tokens / icons / utils             | 각 경계를 초기부터 명확히                                                                                          |
| 릴리스              | Changesets(버전) + 태그 트리거(배포)      | `@brick/*` fixed 버전. npm Trusted Publishing(OIDC), NPM_TOKEN 불필요                                              |

### TypeScript 7이 툴체인에 강제하는 제약

TypeScript 7은 Go 네이티브 포트이고, **npm 패키지의 `exports` 맵에서 클래식 컴파일러 API가 제거**되었습니다.

```jsonc
// typescript@7.0.2 의 exports
{
  ".": "./lib/version.cjs", // 버전 문자열뿐
  "./unstable/ast": "...", // 나머지는 전부 unstable/*
  "./unstable/sync": "...",
}
```

즉 `import ts from "typescript"` 로 컴파일러 API를 쓰던 도구는 전부 동작하지 않습니다.

| 관행적 선택         | TS7에서의 상태                                 | 이 저장소의 대체                                |
| ------------------- | ---------------------------------------------- | ----------------------------------------------- |
| `typescript-eslint` | ❌ peer 범위 `>=4.8.4 <6.1.0`, 클래식 API 의존 | `oxlint` + `oxlint-tsgolint` (버전이 TS에 정렬) |
| `vite-plugin-dts`   | ❌ `unplugin-dts` → 동일 API 의존              | `tsc --emitDeclarationOnly`                     |

부수 효과로 **`tooling/eslint-config` 패키지가 존재하지 않습니다.** oxlint는 루트 `.oxlintrc.json` 하나로 모노레포 전체를 훑고 `overrides` 로 디렉토리별 차이를 처리하므로, 설정을 패키지로 뺄 이유가 없습니다.

> TS 6.0.3 으로 내리면 typescript-eslint / vite-plugin-dts 를 그대로 쓸 수 있습니다. 최신 스택을 택한 대가로 린트·dts 도구를 교체했다는 점을 기억해 두세요.

### 왜 Vanilla Extract인가

Tailwind는 소비 프로젝트도 Tailwind를 써야 하고 `@source`로 패키지 경로를 스캔하게 하거나 프리셋 패키지를 별도 배포해야 합니다. 비-Tailwind 프로젝트에서는 아예 사용할 수 없습니다.

Vanilla Extract는 빌드 시 `.css.ts` → 실제 `.css` + 클래스명 문자열로 컴파일되므로, 소비자는 CSS 한 줄만 import하면 됩니다. 대신 **라이브러리 쪽 빌드 파이프라인(Vite 플러그인) 구성 부담**을 우리가 집니다. 이 트레이드오프를 택했습니다.

---

## 1. 전체 폴더 구조

```
brick-ui/
├─ apps/
│  ├─ storybook/                # 컴포넌트 개발·검증 환경 (Storybook + Vite)
│  └─ docs/                     # 공개 문서 사이트 (Next.js + MDX)
│
├─ packages/                    # ★ 배포 대상
│  ├─ tokens/                   # @brick/tokens   — 디자인 토큰 · 테마 계약
│  ├─ utils/                    # @brick/utils    — 타입 유틸 · cx · ref 병합
│  ├─ core/                     # @brick/core     — Primitive 컴포넌트
│  └─ icons/                    # @brick/icons    — SVG → React 컴포넌트
│
├─ tooling/                     # ★ 전부 private, 배포 안 함
│  ├─ typescript-config/        # @brick/typescript-config
│  └─ vite-config/              # @brick/vite-config (라이브러리 빌드 프리셋)
│
├─ docs/                        # 내부 설계 문서 (이 문서가 있는 곳)
│  └─ architecture.md
│
├─ .changeset/
├─ .oxlintrc.json               # 모노레포 전체 린트 설정 (패키지로 빼지 않음)
├─ .npmrc
├─ pnpm-workspace.yaml
├─ turbo.json
├─ tsconfig.json
└─ package.json                 # private: true, 워크스페이스 루트
```

`packages/`와 `tooling/`을 디렉토리 레벨에서 나눈 이유는 **배포 대상과 내부 도구를 물리적으로 분리**하기 위함입니다. 릴리스 스크립트에서 `--filter "./packages/*"`로 실수 없이 걸러낼 수 있습니다.

### 의존성 그래프

```
        tokens        utils        (leaf, 서로 의존 없음)
           ↘           ↙
             core              icons  (독립)
               ↘         ↙
          storybook / docs
```

- `core → tokens` 방향만 존재하고 역방향은 없습니다.
- `icons`는 `core`에 의존하지 않습니다. 아이콘만 필요한 프로젝트가 컴포넌트 전체를 끌고 오지 않게 하기 위함입니다.

---

## 2. 각 패키지의 역할

### `@brick/tokens` — 계약 계층

Vanilla Extract의 `createThemeContract` / `createGlobalTheme`로 **CSS 변수 이름을 고정**하는 것이 이 패키지의 유일한 책임입니다.

```
packages/tokens/src/
├─ primitives/
│  ├─ palette.ts         # 원시 색상. 컴포넌트가 직접 쓰지 않는다
│  └─ scale.ts           # space / radius / fontSize / lineHeight / shadow …
├─ contract.css.ts       # createGlobalThemeContract — 변수 "이름"만 정의
├─ themes/
│  ├─ values.ts          # ColorTokens 타입 + lightColors / darkColors
│  ├─ base.css.ts        # 테마 무관 변수를 :root 에
│  ├─ light.css.ts       # :root
│  └─ dark.css.ts        # [data-theme="dark"]
├─ index.ts              # 공개 API — CSS 를 만들지 않는다
└─ theme.ts              # 부수효과 전용 엔트리 — CSS 를 만든다
```

핵심은 **contract와 theme의 분리**입니다. `core`는 contract(변수 이름)만 참조하므로, 소비 프로젝트가 `createTheme`으로 자기 테마를 만들어 끼워도 컴포넌트 CSS는 그대로 동작합니다. SEED가 브랜드별 테마를 갈아끼우는 방식과 같습니다.

**`index.ts`와 `theme.ts`를 분리한 이유**가 중요합니다. `index.ts`가 테마 파일을 import하면, `@brick/core`가 `.css.ts` 안에서 `vars`를 참조하는 순간 토큰 테마 CSS가 core의 스타일 번들에도 딸려 들어가 중복 출력됩니다. 이름(계약)과 값(테마)의 진입점은 끝까지 분리합니다.

빌드 산출물 (실측):

- `dist/index.js` — `var(--brick-color-fg-neutral)` 같은 문자열. CSS 참조 없음
- `dist/theme.css` — 3.74 kB, CSS 변수 71개 (`:root` + `[data-theme="dark"]`)

### 토큰 작성 시 걸리는 두 가지

**CSS 변수 이름은 직접 지정합니다.** VE의 기본 동작은 해시 이름 생성인데, 그러면 소비 프로젝트가 순수 CSS로 토큰을 덮어쓸 수 없습니다. 디자인 시스템의 토큰 이름은 공개 API이므로 계약이어야 합니다. `createGlobalThemeContract`에 네이밍 함수를 넘기되, **path 세그먼트를 kebab-case로 변환**해야 합니다. 안 하면 `--brick-fontSize-xs`처럼 CSS 변수에 camelCase가 섞입니다.

**`ColorTokens`는 `interface`가 아니라 `type`이어야 합니다.** VE의 `NullableTokens`는 인덱스 시그니처를 요구하는데, interface는 암묵적 인덱스 시그니처를 갖지 않아 `createGlobalThemeContract`에 넘길 수 없습니다. `type` 별칭은 됩니다.

### `@brick/utils` — 타입/런타임 헬퍼

Primitive 라이브러리의 뼈대가 되는 것들입니다.

- `PolymorphicProps<T, P>` / `forwardRefWithAs` — `<Text as="h1">`을 타입 안전하게
- `cx` (clsx 래핑), `mergeRefs`, `composeEventHandlers`
- `createContextScope` — 복합 컴포넌트 구현 시

> **⚠️ 이 패키지는 반드시 public 배포해야 합니다.**
> `core`의 `.d.ts`가 `PolymorphicProps`를 참조하므로, private으로 두면 소비 측에서 타입 해석이 깨집니다.
> 배포가 부담스러우면 대안은 빌드 시 `core`에 인라인 번들 + dts rollup으로 타입까지 흡수시키는 것입니다.

### `@brick/core` — 본체

```
packages/core/src/
├─ styles/
│  ├─ reset.css.ts           # 최소 리셋 (globalStyle)
│  └─ sprinkles.css.ts       # ★ 유틸리티 CSS 계층
├─ components/
│  ├─ text/
│  │  ├─ Text.tsx
│  │  ├─ Text.css.ts         # recipe()
│  │  ├─ Text.stories.tsx    # 스토리는 여기에 co-locate
│  │  └─ index.ts
│  ├─ box/
│  ├─ stack/
│  ├─ input/
│  └─ ...
├─ types/
└─ index.ts
```

"유틸리티 CSS가 온전히 적용된 상태"의 구현 지점이 **`sprinkles.css.ts`** 입니다. `@vanilla-extract/sprinkles`로 토큰 기반 atomic 클래스를 미리 생성해 두고, 각 컴포넌트는 `recipe`로 그것을 조합합니다.

예를 들어 `Text`는 `truncate` variant를 기본 제공하고, 나머지 여백/색상은 sprinkles prop으로 뚫어주는 형태입니다.

**스토리 파일 위치**: 패키지 안에 co-locate하고 `apps/storybook`이 아래처럼 긁어옵니다.

```ts
// apps/storybook/.storybook/main.ts
stories: ["../../../packages/*/src/**/*.stories.@(ts|tsx)"];
```

컴포넌트 옆에 스토리가 있어야 유지보수가 됩니다.

### `@brick/icons`

`src/svg/*.svg` → SVGR codegen → `src/generated/*.tsx`.

- codegen 산출물은 gitignore하지 말고 **커밋하는 편이 CI·리뷰 모두 편합니다.**
- 트리셰이킹을 위해 `preserveModules` 빌드가 필수입니다.

### `tooling/*`

| 패키지              | 내용                                             |
| ------------------- | ------------------------------------------------ |
| `typescript-config` | `base.json` / `react-library.json` / `next.json` |
| `vite-config`       | **라이브러리 빌드 프리셋을 함수로 export**       |

`vite-config`는 `library.mjs` 한 파일에 `vanillaExtractPlugin`, `preserveModules`, `"use client"` 지시어 보존, external 자동 추출을 모아둡니다. 각 패키지의 `vite.config.ts`는 3줄로 끝납니다.

```ts
import { createLibraryConfig } from "@brick/vite-config/library";

export default createLibraryConfig({ pkgDir: import.meta.dirname });
```

TS가 아닌 **`.mjs`로 작성**한 이유는, Vite가 설정 파일을 로드할 때 워크스페이스 의존성의 TS 소스를 번들링할지 여부가 상황에 따라 달라 불안정하기 때문입니다. 빌드 도구 자신이 빌드를 필요로 하는 순환도 피할 수 있습니다. 타입은 옆에 둔 `library.d.ts`가 제공합니다.

external은 각 패키지 `package.json`의 `dependencies` + `peerDependencies`에서 자동 추출합니다. 손으로 관리하면 반드시 빠뜨립니다.

---

## 3. package.json 설정 방향

### 루트

```jsonc
{
  "name": "brick-ui",
  "private": true,
  "packageManager": "pnpm@11.17.0",
  "engines": { "node": ">=22" },
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "typecheck": "turbo run typecheck",
    "lint": "oxlint --type-aware",
    "format": "prettier --write .",
    "changeset": "changeset",
    "version-packages": "changeset version && pnpm install --lockfile-only",
    "release": "turbo run build --filter='./packages/*' && changeset publish",
  },
  "devDependencies": {
    "oxlint": "^1.76.0",
    "oxlint-tsgolint": "^7.0.2001",
    "prettier": "^3.9.6",
    "turbo": "^2.10.7",
    "typescript": "catalog:",
  },
}
```

`lint`만 turbo를 거치지 않습니다. oxlint는 저장소 전체를 한 번에 훑는 게 패키지별로 쪼개는 것보다 빠릅니다.

### `pnpm-workspace.yaml` — catalog 활용

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"

# pnpm 11 은 postinstall 스크립트를 기본 차단한다. 빌드가 필요한 것만 허용.
# (pnpm 10 의 onlyBuiltDependencies 목록형에서 맵형으로 바뀌었다)
allowBuilds:
  esbuild: true

catalog:
  react: ^19.2.8
  react-dom: ^19.2.8
  "@types/react": ^19.2.17
  "@types/react-dom": ^19.2.3
  typescript: ^7.0.2
  vite: ^8.1.5
  "@vanilla-extract/css": ^1.21.2
  "@vanilla-extract/sprinkles": ^1.7.0
  "@vanilla-extract/recipes": ^0.5.7
  "@vanilla-extract/vite-plugin": ^5.2.6
```

pnpm catalog로 React/TS 버전을 한 곳에서 고정하면, 패키지가 10개로 늘어나도 버전 드리프트가 생기지 않습니다. 각 패키지는 `"react": "catalog:"`로 참조합니다.

### `@brick/core` package.json

```jsonc
{
  "name": "@brick/core",
  "version": "0.0.0",
  "type": "module",
  "sideEffects": ["**/*.css", "**/*.css.ts"],
  "files": ["dist"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
    },
    "./styles.css": "./dist/styles.css",
    "./package.json": "./package.json",
  },
  "publishConfig": { "access": "public" },
  "scripts": {
    "build": "vite build && pnpm build:types",
    "build:types": "tsc --emitDeclarationOnly --declaration --outDir dist",
    "dev": "vite build --watch",
    "typecheck": "tsc --noEmit",
  },
  "dependencies": {
    "@brick/tokens": "workspace:^",
    "@brick/utils": "workspace:^",
    "clsx": "^2",
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18",
  },
  "devDependencies": {
    "@brick/typescript-config": "workspace:*",
    "@brick/vite-config": "workspace:*",
    "@vanilla-extract/css": "catalog:",
    "@vanilla-extract/recipes": "^0.5",
    "@vanilla-extract/sprinkles": "^1",
  },
}
```

#### 짚어둘 4가지

**① VE 패키지마다 `dependencies` / `devDependencies` 가 갈립니다**

| 패키지                       | 위치               | 이유                                               |
| ---------------------------- | ------------------ | -------------------------------------------------- |
| `@vanilla-extract/css`       | `devDependencies`  | 진짜 제로 런타임. 빌드 후 클래스명 문자열만 남는다 |
| `@vanilla-extract/recipes`   | **`dependencies`** | `recipe()` 가 `createRuntimeFn` 을 반환한다        |
| `@vanilla-extract/sprinkles` | **`dependencies`** | `sprinkles()` 자체가 런타임 함수다                 |
| `@vanilla-extract/dynamic`   | **`dependencies`** | `assignInlineVars` 는 런타임 호출                  |

"Vanilla Extract = 제로 런타임"은 `@vanilla-extract/css` 에만 해당합니다. recipes 와 sprinkles 는 작지만 실제 런타임 코드를 포함하며, 이걸 `devDependencies` 로 두면 번들에 인라인되면서 **`dist/node_modules/.pnpm/@vanilla-extract_sprinkles@1.7.0_.../...` 같은 경로가 산출물에 그대로 박힙니다.** `dependencies` 로 옮기면 external 처리되어 사라집니다.

**② `sideEffects: ["**/*.css"]`**

없으면 번들러가 CSS import를 죽여서 스타일이 통째로 사라집니다. **가장 흔한 사고 지점입니다.**

`**/*.css.ts`가 왜 같이 필요한지는 실제로 당해봐야 압니다. Vite의 resolve 플러그인은 이 글롭을 **소비자뿐 아니라 자기 패키지 소스에도 적용**합니다. `**/*.css`만 적으면 `src/themes/light.css.ts`가 매치되지 않아 "부수효과 없는 모듈"로 판정되고, `import "./themes/light.css"` 같은 부수효과 전용 import가 트리셰이킹으로 제거됩니다.

결과는 조용한 실패입니다 — 빌드는 성공하고, 산출 JS는 멀쩡하고, **CSS 파일만 생성되지 않습니다.** 에러도 경고도 없습니다. 2단계에서 `dist/theme.css`가 통째로 누락된 원인이 이것이었습니다.

**부수효과 엔트리 자체도 목록에 넣어야 합니다.** `theme.ts` / `styles.ts` 는 확장자가 `.css.ts` 가 아니므로 위 글롭에 걸리지 않습니다. 우리 패키지를 빌드할 때는 이들이 *엔트리 포인트*라 트리셰이킹 대상이 아니어서 문제가 드러나지 않지만, **Storybook처럼 이들을 그냥 import 하는 쪽에서는 통째로 제거됩니다.**

```jsonc
// @brick/tokens
"sideEffects": ["**/*.css", "**/*.css.ts", "**/theme.ts", "**/theme.js", "**/theme.cjs"]
// @brick/core
"sideEffects": ["**/*.css", "**/*.css.ts", "**/styles.ts", "**/styles.js", "**/styles.cjs"]
```

4단계에서 Storybook 화면에 컴포넌트 CSS는 나오는데 토큰 변수만 0개인 상태로 나타났습니다. 증상이 2단계와 같고 원인 위치만 달랐습니다.

> 빌드 성공을 통과 기준으로 삼으면 안 됩니다. `dist` 안에 CSS가 실제로 있는지, 그 안에 기대한 변수가 들어 있는지까지 확인해야 합니다.

**③ `workspace:^` vs `workspace:*`**

`workspace:^`은 배포 시 `^0.1.0`으로 치환되고, `workspace:*`는 정확한 버전으로 고정됩니다.

- 배포 패키지 간 참조 → `workspace:^`
- 내부 tooling 참조 → `workspace:*`

**④ `"./styles.css"` 서브패스 export**

소비 측 진입점이 딱 두 줄이 됩니다.

```ts
// 소비 프로젝트 root layout
import "@brick/tokens/theme.css";
import "@brick/core/styles.css";
```

### `@brick/tokens` package.json

`core`와 동일한 골격이되,

- `peerDependencies` 없음 (React 무관)
- `exports`에 `"./theme.css": "./dist/theme.css"` 추가

### `tooling/*` package.json

```jsonc
{
  "name": "@brick/typescript-config",
  "version": "0.0.0",
  "private": true,
  "files": ["*.json"],
  "exports": {
    "./base": "./base.json",
    "./react-library": "./react-library.json",
  },
}
```

---

## 4. turbo.json

```jsonc
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
    },
    "dev": { "cache": false, "persistent": true },
    "typecheck": { "dependsOn": ["^build"] },
    "lint": { "dependsOn": ["^build"] },
    "test": { "dependsOn": ["^build"] },
    "build-storybook": {
      "dependsOn": ["^build"],
      "outputs": ["storybook-static/**"],
    },
  },
}
```

`typecheck`와 `lint`에 `^build`를 건 이유는 `core`의 타입 검사가 `tokens/dist/index.d.ts`를 필요로 하기 때문입니다.

> **VE 특성상 `tokens`가 먼저 빌드되어야 `core`가 참조할 CSS 변수명이 확정됩니다.**
> 이 스택에서 가장 순서에 민감한 부분입니다.

---

## 5. 배포 전 반드시 정리해야 할 것

### RSC 대응

소비처가 Next.js App Router라면 hook을 쓰는 컴포넌트에 `"use client"`가 필요하고, 빌드 시 이 지시어가 보존되어야 합니다 (`rollup-plugin-preserve-directives`).

다만 Primitive 대부분은 상태가 없으므로, **기본은 서버 컴포넌트로 두고 필요한 것만 client로 표시**하는 게 맞습니다.

### 빌드 산출물에 `.css.ts`를 절대 포함하지 말 것

컴파일된 `.js` + `.css`만 배포합니다. `.css.ts`가 섞여 나가면 소비자 빌드에 VE 플러그인을 강제하게 되어 이 스택을 고른 의미가 사라집니다.

### 버전 정책

Changesets의 `fixed`로 `@brick/*`를 묶어 **항상 같은 버전**을 유지합니다.

```jsonc
// .changeset/config.json
{
  "changelog": "@changesets/cli/changelog",
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "fixed": [["@brick/*"]],
  "linked": [],
  "ignore": [],
}
```

**`linked` 가 아니라 `fixed` 인 이유**는 릴리스 트리거가 태그이기 때문입니다. `v0.2.0` 태그 하나가 모든 `@brick/*` 를 가리켜야 "태그 = 배포 버전"이 성립합니다. `linked` 는 변경된 패키지만 올려서 버전이 갈라지고, 그러면 태그가 무엇을 뜻하는지 모호해집니다. 변경되지 않은 패키지도 같이 올라가는 비용을 치르는 대신, 소비자 입장도 단순해집니다 — `@brick/*` 는 전부 같은 버전을 쓰면 됩니다.

**글롭이어야 합니다.** 패키지 이름을 나열하면 명시적이라 좋아 보이지만, changesets 는 목록의 모든 이름이 실제로 존재하는지 검증하므로 **아직 만들지 않은 패키지를 적어두면 설정 자체가 로드되지 않습니다.** `@brick/icons` 를 미리 적었다가 `changeset status` 가 통째로 실패했습니다.

`ignore` 가 비어 있어도 됩니다. `tooling/*` 와 `apps/*` 는 `private: true` 이므로 changesets 가 자동으로 제외합니다.

### CI 파이프라인

`.github/workflows/ci.yml` — push/PR 마다 `format:check` → `lint` → `typecheck` → `build` → **`verify:dist`** → Storybook 빌드.

`verify:dist`(`scripts/verify-dist.mjs`)가 이 파이프라인의 핵심입니다. 이 저장소는 **빌드가 성공하면서 CSS 만 사라지는 실패를 두 번** 겪었습니다. 그래서 빌드 성공을 통과 기준으로 삼지 않고, `dist` 안에 기대한 내용이 실제로 있는지 검사합니다.

검사 항목:

- 엔트리 파일(`index.js` / `index.cjs` / `index.d.ts`)과 CSS 파일의 존재 및 최소 크기
- `theme.css` 의 시맨틱 토큰과 `[data-theme` 다크 블록, CSS 변수 60개 이상
- `styles.css` 의 토큰 참조 · truncate · lineClamp 스타일
- `styles.css` 에 **하드코딩된 색상값이 없을 것** (원시 팔레트 직접 사용 방지)
- `index.js` 가 CSS 를 끌어오지 않을 것 (이름/값 진입점 분리)
- `dist` 에 `node_modules` 경로 누출이 없을 것 (런타임 의존성 external 처리 확인)
- `package.json` 의 `exports` 가 가리키는 파일이 실제로 존재할 것
- 스토리와 타입 테스트가 배포물에 섞이지 않을 것

> 스크립트를 만든 뒤 **일부러 `sideEffects` 를 망가뜨려 실제로 검출되는지 확인했습니다.** 빌드는 에러 없이 성공했고 검증은 5건을 잡아냈습니다. 검증 스크립트도 검증해야 신뢰할 수 있습니다.

### 배포 파이프라인

**배포 트리거는 태그 하나뿐입니다.** main 에 푸시하는 것만으로는 npm 에 아무것도 올라가지 않습니다.

```
PR(+changeset) 머지
   ↓
version.yml  →  "Version Packages" PR 생성/갱신   ← 여기서는 배포 안 함
   ↓
그 PR 머지 (버전 · CHANGELOG 갱신)
   ↓
사람이 git tag v0.1.0 && git push origin v0.1.0
   ↓
release.yml  →  빌드 → verify:dist --release → npm 배포 → GitHub Release
```

이 구조를 택한 이유가 있습니다. `changesets/action` 에 `publish` 입력을 주면 **changeset 이 하나도 없을 때 곧바로 발행을 시도합니다.** 설정 직후에는 changeset 이 0개이므로, main 에 푸시하는 순간 `0.0.0` 이 npm 에 올라갈 수 있습니다. npm 배포는 되돌릴 수 없습니다. 그래서 `version.yml` 에는 `publish` 를 주지 않고, 발행은 태그 워크플로가 전담합니다.

#### 인증: Trusted Publishing (OIDC)

`NPM_TOKEN` 장기 시크릿을 쓰지 않습니다. GitHub Actions 의 OIDC 토큰으로 발행하고 provenance(배포 출처 증명)까지 붙입니다.

두 가지 전제가 있습니다.

- **npm 11.5.1 이상** — Node 22 기본은 10.x 이므로 워크플로에서 `npm install -g npm@latest` 를 먼저 실행합니다
- **`setup-node` 에 `registry-url` 을 주지 않을 것** — 주면 `.npmrc` 에 `_authToken` 이 더미값으로 채워지고, npm 은 토큰이 있으면 OIDC 를 시도하지 않아 404 가 납니다

#### `changeset publish` 를 쓰지 않는 이유

발행은 `scripts/publish-packages.mjs` 가 직접 합니다. OIDC + provenance 경로를 확실히 태우기 위해서입니다.

다만 `npm publish` 는 `workspace:^` 프로토콜을 모릅니다. 그대로 발행하면 소비자가 설치할 수 없는 `package.json` 이 올라갑니다. 그래서 **`pnpm pack` 으로 프로토콜이 치환된 tarball 을 먼저 만들고, 그 tarball 을 `npm publish` 로 발행**합니다.

스크립트가 하는 일:

- 태그 버전과 모든 패키지 버전이 일치하는지 검사 (`--expect-version`)
- 이미 발행된 버전은 건너뜀 (재실행 안전)
- `pnpm pack` → `npm publish <tarball> --provenance --access public`

`pnpm release:dry` 로 발행 직전까지 로컬에서 리허설할 수 있습니다.

#### 이중 안전장치

`verify-dist.mjs --release` 는 버전이 `0.0.0` 이면 배포를 거부합니다. 태그를 잘못 달거나 changeset 없이 배포 경로에 들어서는 것을 한 번 더 막습니다.

---

## 6. FSD 프로젝트에서의 소비 형태

```
src/shared/ui/
├─ index.ts          # export { Text, Box, Stack } from "@brick/core";
└─ text/
   └─ index.tsx      # 사내 규칙 덧입힐 때만 래핑
```

`shared/ui`를 얇은 re-export 배럴로 두면, 나중에 `@brick/core`를 교체하거나 사내 전용 prop을 얹을 때 **애플리케이션 코드 수정 없이** 이 레이어에서만 흡수됩니다.

---

## 7. 구축 순서

| 단계 | 내용                                     | 완료 기준                                                |
| ---- | ---------------------------------------- | -------------------------------------------------------- |
| 1    | 루트 워크스페이스 + turbo + tooling 3종  | `typescript-config` → `eslint-config` → `vite-config` 순 |
| 2    | `@brick/tokens` — contract + light 테마  | **빌드 통과 + dist 산출물 눈으로 확인**                  |
| 3    | `@brick/utils` — polymorphic 타입만 먼저 | `<Text as="h1">` 타입 추론 확인                          |
| 4    | `@brick/core` — `Text` 하나만            | `apps/storybook`에서 화면에 렌더 확인                    |
| 5    | **로컬 소비 검증**                       | `pnpm pack` → 별도 Vite 앱에 설치해서 동작 확인          |
| 6    | Changesets + CI                          | 릴리스 파이프라인                                        |
| 7    | `@brick/icons`, `apps/docs`              | —                                                        |

> **5단계를 초반에 하지 않으면**, exports/sideEffects 문제를 컴포넌트 20개 만든 뒤에 발견하게 됩니다. 반드시 컴포넌트 1개 시점에 한 번 검증하세요.

### 로컬 소비 검증 절차

`pnpm pack` 으로 tarball 을 만들어 **모노레포 바깥**의 앱에 설치합니다. 워크스페이스 링크로는 `exports` 맵이 제대로 검증되지 않습니다.

주의할 점 하나. `workspace:^` 는 `^0.0.0` 으로 치환되는데, 이 버전은 레지스트리에 없으므로 `@brick/core` 가 의존하는 `@brick/tokens` 해석이 404 로 실패합니다. 소비자 쪽에 override 를 걸어야 합니다.

```yaml
# 소비자 앱의 pnpm-workspace.yaml
# (pnpm 11 은 package.json 의 pnpm.overrides 를 더 이상 읽지 않는다)
overrides:
  "@brick/tokens": "file:/path/to/brick-tokens-0.0.0.tgz"
  "@brick/utils": "file:/path/to/brick-utils-0.0.0.tgz"
```

#### 5단계 실측 결과

| 검증 항목                            | 결과                                                    |
| ------------------------------------ | ------------------------------------------------------- |
| `moduleResolution: bundler` 타입체크 | 통과                                                    |
| `moduleResolution: node16` 타입체크  | 통과 — 확장자 없는 `.d.ts` 재수출도 문제없음            |
| CJS `require()`                      | 통과 (`Text`, `sprinkles`, `vars`, `cx` 모두 해석)      |
| 소비자 빌드 CSS                      | 13.69 kB, CSS 변수 71개, `[data-theme=dark]` 블록 포함  |
| `node_modules` 경로 누출             | 0건                                                     |
| JS 트리셰이킹                        | 동작 — `Text` 만 쓰면 sprinkles 런타임 11.8 kB 제외     |
| **CSS 트리셰이킹**                   | **안 됨 — 단일 `styles.css` 라 유틸리티 전체가 따라옴** |

CSS 가 트리셰이킹되지 않는 것은 단일 스타일시트 구조의 필연입니다. 현재 `Text` 하나만 써도 10.4 kB(gzip 1.7 kB)를 받습니다. 컴포넌트가 늘어도 유틸리티 계층은 고정이므로 증가폭은 완만하지만, 임계를 넘으면 컴포넌트별 CSS 분리나 `@layer` 분할을 검토해야 합니다.

> 2단계에서 우려했던 `.d.ts` 확장자 문제는 실재하지 않았습니다. `contract.css.d.ts` 파일이 실제로 존재하므로 `from "./contract.css"` 가 `node16` 에서도 해석됩니다. 대신 예상 못 한 곳에서 걸렸습니다 — 소비자에게 번들러 앰비언트 타입(`vite/client` 등)이 없으면 `import "@brick/core/styles.css"` 자체가 TS2882 로 실패합니다.
