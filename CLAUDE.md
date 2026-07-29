# CLAUDE.md

이 저장소에서 작업할 때 참고할 지침입니다.

## 프로젝트

HTML 기본 태그를 유틸리티 CSS가 적용된 상태로 래핑한 React Primitive 컴포넌트 라이브러리. pnpm workspace + Turborepo 모노레포이며, `@brick/*` 형태로 npm에 배포해 외부/사내 프로젝트가 임포트해 씁니다.

**설계 근거는 `docs/architecture.md`에 있습니다.** 구조나 빌드 설정을 바꾸기 전에 먼저 읽고, 바꿨으면 그 문서도 같이 갱신하세요.

## 명령어

```bash
pnpm build                          # turbo run build
pnpm typecheck                      # turbo run typecheck
pnpm lint                           # oxlint --type-aware (turbo 안 거침, 저장소 전체 한 번에)
pnpm format                         # prettier --write .
pnpm --filter @brick/tokens build   # 단일 패키지
```

## 툴체인 제약 (중요)

TypeScript 7은 npm 패키지 `exports`에서 클래식 컴파일러 API를 제거했습니다. `import ts from "typescript"`에 의존하는 도구는 **전부 동작하지 않습니다.**

- `typescript-eslint` → **`oxlint` + `oxlint-tsgolint`** 를 씁니다. ESLint 설정 파일을 만들지 마세요
- `vite-plugin-dts` → **`tsc -p tsconfig.build.json`** (`emitDeclarationOnly`) 로 `.d.ts`를 만듭니다

새 도구를 추가하기 전에 그 도구가 TS 컴파일러 API에 의존하는지 확인하세요.

## 빌드 파이프라인의 함정

**`sideEffects`에 `**/*.css.ts`를 반드시 포함하세요.** Vite의 resolve 플러그인은 이 글롭을 자기 패키지 소스에도 적용합니다. `**/*.css`만 적으면 `src/**/*.css.ts`가 "부수효과 없는 모듈"로 판정돼 트리셰이킹으로 제거됩니다. **빌드는 성공하고 CSS 파일만 조용히 사라집니다.**

**빌드 성공을 통과 기준으로 삼지 마세요.** `dist`에 CSS가 실제로 있는지, 그 안에 기대한 변수/클래스가 들어 있는지 직접 확인해야 합니다.

**토큰의 이름과 값은 진입점을 분리합니다.** `index.ts`는 변수 이름만, `theme.ts`는 CSS만 내보냅니다. `index.ts`가 테마를 import하면 `@brick/core` 빌드에 토큰 테마 CSS가 중복으로 딸려 들어갑니다.

**`tokens`가 먼저 빌드돼야 `core`가 참조할 변수명이 확정됩니다.** turbo의 `dependsOn: ["^build"]`가 이걸 보장합니다. 임의로 풀지 마세요.

## 코드 컨벤션

- **CSS 변수는 kebab-case.** `--brick-color-fg-neutral` 형태. 네이밍 함수에서 camelCase 키를 변환합니다
- **컴포넌트는 원시 팔레트를 직접 쓰지 않습니다.** 반드시 시맨틱 토큰(`vars.color.*`)을 거칩니다
- **Vanilla Extract에 넘길 토큰 타입은 `interface`가 아니라 `type`.** interface는 암묵적 인덱스 시그니처가 없어 `NullableTokens`에 대입되지 않습니다
- **배포 패키지의 `dependencies`/`peerDependencies`는 자동으로 external 처리됩니다.** `tooling/vite-config/library.mjs`가 `package.json`에서 추출하므로 손으로 관리하지 마세요
- 스토리 파일은 컴포넌트 옆에 co-locate (`Text.stories.tsx`)
- 주석은 "무엇"이 아니라 **"왜"** 를 씁니다. 특히 우회책이나 비직관적 선택에는 근거를 남깁니다

## 로컬 환경

- **포트 3000~3006은 다른 프로젝트가 점유 중입니다.** `apps/docs`는 3100, `apps/storybook`은 6006을 씁니다
- 셸에서 `_safe_eval: command not found` 가 뜨면 scm_breeze 충돌입니다. `/bin/ls`, `/usr/bin/git` 등 절대경로로 우회하세요. 명령 자체는 정상 동작합니다
- 복합 명령에서 `cd`가 먹지 않는 경우가 있습니다. `pnpm --dir <path>` 나 절대경로를 쓰세요

## 커밋

- 한국어로 작성. `feat(scope):` / `chore:` / `fix:` 형태
- 본문에는 **무엇을 했는지보다 왜 그렇게 했는지**를 씁니다. 특히 우회책은 원인과 증상을 남겨야 나중에 되돌리지 않습니다
- 커밋과 푸시는 사용자가 요청할 때만 합니다
