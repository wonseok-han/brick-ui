# brick-ui

HTML의 기본 태그를 **유틸리티 CSS가 온전히 적용된 상태로 래핑한 Primitive 컴포넌트** 모음집입니다.

복잡한 비즈니스 로직이나 화려한 인터랙션은 목표가 아닙니다. `p`, `div`, `span`, `input` 같은 태그를 매번 다시 스타일링하지 않도록, 말줄임·여백·타이포그래피가 기본으로 잡힌 얇은 래퍼를 제공하는 것이 전부입니다. 당근의 [SEED](https://seed-design.io)에서 구조적 접근을 참고했습니다.

> **🚧 개발 초기 단계입니다.** 아직 배포된 버전이 없고 공개 API가 자주 바뀝니다.

## 패키지

| 패키지          | 설명                                | 상태       |
| --------------- | ----------------------------------- | ---------- |
| `@brick/tokens` | CSS 변수 계약과 라이트/다크 테마    | ✅ 구현됨  |
| `@brick/utils`  | polymorphic 타입, `cx`, `mergeRefs` | ✅ 구현됨  |
| `@brick/core`   | Primitive 컴포넌트 (`Text`)         | 🚧 진행 중 |
| `@brick/icons`  | SVG → React 컴포넌트                | ⬜ 예정    |

## 기술 스택

- **pnpm workspace** + **Turborepo** — 모노레포
- **React 19** + **TypeScript 7**
- **Vanilla Extract** — 제로 런타임 CSS. 소비 프로젝트의 빌드 설정에 의존하지 않습니다
- **oxlint** + **Prettier**
- **Storybook 10** (컴포넌트 개발) / **Next.js** (공개 문서) — 문서 사이트는 예정

TypeScript 7이 클래식 컴파일러 API를 제거해 `typescript-eslint`와 `vite-plugin-dts`를 쓸 수 없습니다. 각각 `oxlint`와 `tsc --emitDeclarationOnly`로 대체했습니다. 자세한 내용은 [아키텍처 문서](./docs/architecture.md#typescript-7이-툴체인에-강제하는-제약)를 참고하세요.

## 사용 (예정)

```bash
pnpm add @brick/core @brick/tokens
```

```tsx
// 진입점에서 한 번만
import "@brick/tokens/theme.css";
import "@brick/core/styles.css";
```

> CSS를 import하려면 프로젝트에 번들러의 앰비언트 타입이 있어야 합니다. Vite는 `src/vite-env.d.ts`의 `/// <reference types="vite/client" />`, Next.js는 `next-env.d.ts`가 이 역할을 합니다. 없으면 `TS2882: Cannot find module or type declarations for side-effect import` 이 납니다. 라이브러리 문제가 아니라 CSS를 배포하는 모든 패키지에 공통인 사항입니다.

```tsx
import { Text } from "@brick/core";

<Text as="h1" size="2xl" weight="bold">
  제목
</Text>;

// 말줄임은 기본 제공
<Text truncate>아주 긴 텍스트…</Text>;
```

다크 테마는 `data-theme` 속성으로 전환합니다.

```html
<html data-theme="dark"></html>
```

## 개발

```bash
pnpm install
pnpm build          # 전체 빌드 (turbo가 패키지 간 순서를 해결)
pnpm typecheck
pnpm lint           # oxlint --type-aware
pnpm format
pnpm verify:dist    # 배포 산출물에 CSS와 타입이 실제로 들어갔는지 검사
```

컴포넌트를 보면서 작업할 때:

```bash
pnpm --filter @brick/storybook dev   # http://localhost:6006
```

Storybook은 `@brick/*`를 `dist`가 아니라 `src`로 해석합니다. 컴포넌트와 `.css.ts`를 고치면 즉시 반영되고, 패키지를 다시 빌드할 필요가 없습니다.

특정 패키지만 작업할 때:

```bash
pnpm --filter @brick/tokens build
pnpm --filter @brick/tokens dev     # watch 모드
```

## 기여

`packages/*`를 변경했다면 changeset을 함께 올려주세요.

```bash
pnpm changeset
```

main에 머지되면 GitHub Actions가 "Version Packages" PR을 엽니다. 그 PR을 머지한 뒤 **`v0.1.0` 같은 태그를 푸시해야** npm에 배포됩니다 — main 푸시만으로는 배포되지 않습니다. 자세한 내용은 [`.changeset/README.md`](./.changeset/README.md)에 있습니다.

## 저장소 구조

```
brick-ui/
├─ apps/            # storybook (docs 는 예정)
├─ packages/        # 배포 대상 — tokens, utils, core, icons
├─ tooling/         # 내부 전용 — typescript-config, vite-config
└─ docs/            # 설계 문서
```

설계 근거와 의사결정 기록은 [`docs/architecture.md`](./docs/architecture.md)에 있습니다. 패키지를 추가하거나 빌드 설정을 건드리기 전에 읽어보시길 권합니다.
