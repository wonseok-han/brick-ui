# AGENTS.md

Codex와 기타 코딩 에이전트가 이 저장소에서 작업할 때 따르는 지침입니다.

## 먼저 읽을 문서

- 프로젝트 구조나 빌드 설정을 바꾸기 전에 `docs/architecture.md`를 읽습니다.
- 세부 툴체인 제약과 로컬 검증 절차는 `CLAUDE.md`를 따릅니다.
- 구조나 빌드 방식이 바뀌면 코드와 함께 관련 문서도 갱신합니다.

## 프로젝트 개요

`brick-ui`는 HTML 기본 태그를 유틸리티 CSS가 적용된 상태로 감싼 React Primitive
컴포넌트 디자인 시스템입니다. pnpm workspace와 Turborepo를 사용합니다.

의존 방향은 다음과 같습니다.

```text
tokens ─┐
        ├─> core ─┐
utils ──┘         ├─> storybook / docs
icons ────────────┘
```

- `@brick/tokens`: CSS 변수 계약과 라이트/다크 테마
- `@brick/utils`: polymorphic 타입과 공용 유틸
- `@brick/core`: Primitive 컴포넌트
- `@brick/icons`: `currentColor` 기반 React SVG 컴포넌트
- Storybook: `src`를 직접 소비하는 개발/HMR 표면
- docs: 빌드된 `dist`를 소비하는 실제 사용자 환경 검증 표면

## 필수 명령

```bash
pnpm format:check
pnpm --filter @brick/icons generate:check
pnpm lint
pnpm typecheck
pnpm build
pnpm verify:dist
pnpm --filter @brick/storybook build-storybook
```

변경 범위에 맞는 검증부터 실행하고, 완료 전에는 영향받는 전체 검증을 실행합니다.
UI 변경은 Storybook 또는 docs를 실제로 실행해 브라우저에서 확인합니다.

## 구현 규칙

- TypeScript 7을 사용합니다. ESLint와 `typescript-eslint`를 추가하지 않습니다.
- 린트는 `oxlint --type-aware`, 선언 생성은 `tsc --emitDeclarationOnly`를 사용합니다.
- Vanilla Extract의 `.css.ts`는 빌드 시 실제 CSS로 변환됩니다.
- 컴포넌트는 원시 팔레트를 직접 참조하지 않고 `vars.color.*` 시맨틱 토큰을 씁니다.
- 토큰의 이름 계약(`index.ts`)과 값/CSS(`theme.ts`) 진입점을 합치지 않습니다.
- CSS 변수 이름은 `--brick-color-fg-neutral` 형태의 kebab-case를 유지합니다.
- Vanilla Extract 토큰 형태는 `interface`가 아닌 `type`으로 정의합니다.
- `sideEffects`에서 `**/*.css`, `**/*.css.ts`, `theme.ts` 또는 `styles.ts`를 누락하지 않습니다.
- `recipes`, `sprinkles`, `dynamic`처럼 런타임 코드가 있는 패키지는 `dependencies`에 둡니다.
- 배포 패키지 의존성의 external 처리는 `tooling/vite-config/library.mjs`에 맡깁니다.
- 스토리는 컴포넌트 옆에 co-locate합니다.
- 주석에는 코드가 무엇을 하는지보다 비직관적인 선택의 이유를 기록합니다.

## 변경 시 주의사항

- `packages/*`를 변경하면 changeset이 필요한지 확인하고, 배포 대상 변경에는 함께 추가합니다.
- 아이콘 SVG를 바꾸면 `pnpm --filter @brick/icons generate`를 실행하고 생성물을 포함합니다.
- `exports`, 패키지 의존성, CSS 진입점을 바꾸면 빌드 성공만 믿지 말고
  `pnpm verify:dist`와 필요 시 `pnpm pack` 소비 검증까지 수행합니다.
- `tokens`가 `core`보다 먼저 빌드되는 `turbo.json`의 `dependsOn: ["^build"]`를 유지합니다.
- Next.js의 `experimental.useTypeScriptCli`는 TypeScript 7 호환에 필요합니다.
- 커밋과 푸시는 사용자가 요청할 때만 합니다.
- 커밋 메시지는 한국어로 작성하고 `feat(scope):`, `fix:`, `chore:` 형식을 따릅니다.

## 로컬 환경

- docs 포트는 `3100`, Storybook 포트는 `6006`입니다.
- `_safe_eval` 또는 `exec_scmb_expand_args: command not found: _safe_eval` 오류가 나면
  scm_breeze 충돌이므로 `/bin/ls`, `/usr/bin/git`, `/usr/bin/find`처럼 절대경로를 씁니다.
- 복합 셸 명령에서 `cd`가 불안정하면 도구의 작업 디렉터리 옵션이나 절대경로를 씁니다.

## 배포 안전장치

- 배포는 `v*` 태그로만 시작합니다. `main` 푸시는 npm 발행 트리거가 아닙니다.
- `@brick/*`는 Changesets의 fixed 그룹으로 같은 버전을 유지합니다.
- npm Trusted Publishing(OIDC)을 사용하므로 `NPM_TOKEN`이나 `setup-node`의
  `registry-url`을 추가하지 않습니다.
- 발행은 `scripts/publish-packages.mjs`가 `pnpm pack`으로 `workspace:^`를 치환한
  tarball을 만든 뒤 수행합니다.
