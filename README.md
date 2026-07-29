# brick-ui

HTML의 기본 태그를 **유틸리티 CSS가 온전히 적용된 상태로 래핑한 Primitive 컴포넌트** 모음집입니다.

복잡한 비즈니스 로직이나 화려한 인터랙션은 목표가 아닙니다. `p`, `div`, `span`, `input` 같은 태그를 매번 다시 스타일링하지 않도록, 말줄임·여백·타이포그래피가 기본으로 잡힌 얇은 래퍼를 제공하는 것이 전부입니다. 당근의 [SEED](https://seed-design.io)에서 구조적 접근을 참고했습니다.

> **🚧 개발 초기 단계입니다.** 아직 배포된 버전이 없고 공개 API가 자주 바뀝니다.

## 패키지

| 패키지          | 설명                                | 상태      |
| --------------- | ----------------------------------- | --------- |
| `@brick/tokens` | CSS 변수 계약과 라이트/다크 테마    | ✅ 구현됨 |
| `@brick/utils`  | polymorphic 타입, `cx`, `mergeRefs` | ⬜ 예정   |
| `@brick/core`   | Primitive 컴포넌트                  | ⬜ 예정   |
| `@brick/icons`  | SVG → React 컴포넌트                | ⬜ 예정   |

## 기술 스택

- **pnpm workspace** + **Turborepo** — 모노레포
- **React 19** + **TypeScript 7**
- **Vanilla Extract** — 제로 런타임 CSS. 소비 프로젝트의 빌드 설정에 의존하지 않습니다
- **oxlint** + **Prettier**
- **Storybook** (개발) + **Next.js** (공개 문서) — 예정

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
```

특정 패키지만 작업할 때:

```bash
pnpm --filter @brick/tokens build
pnpm --filter @brick/tokens dev     # watch 모드
```

## 저장소 구조

```
brick-ui/
├─ apps/            # storybook, docs (예정)
├─ packages/        # 배포 대상 — tokens, utils, core, icons
├─ tooling/         # 내부 전용 — typescript-config, vite-config
└─ docs/            # 설계 문서
```

설계 근거와 의사결정 기록은 [`docs/architecture.md`](./docs/architecture.md)에 있습니다. 패키지를 추가하거나 빌드 설정을 건드리기 전에 읽어보시길 권합니다.

## 라이선스

[MIT](./LICENSE)
