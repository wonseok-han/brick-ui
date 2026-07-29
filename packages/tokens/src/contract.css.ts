import { createGlobalThemeContract } from "@vanilla-extract/css";

import {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  radius,
  shadow,
  space,
} from "./primitives/scale";
import { lightColors } from "./themes/values";

/**
 * CSS 변수 이름을 `--brick-color-fg-neutral` 처럼 사람이 읽을 수 있게 고정한다.
 *
 * Vanilla Extract 의 기본 동작은 해시 이름 생성이다. 그걸 쓰면 소비 프로젝트가
 * 순수 CSS 로 토큰을 덮어쓸 수 없고, 빌드마다 이름이 바뀔 위험도 있다.
 * 디자인 시스템의 토큰은 공개 API 이므로 이름이 계약이어야 한다.
 */
/** `fontSize` → `font-size`, `onSolid` → `on-solid`. `2xl` 같은 키는 그대로 둔다. */
const kebab = (segment: string) => segment.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

const toVarName = (_value: string | null, path: string[]) => `brick-${path.map(kebab).join("-")}`;

/**
 * 라이트/다크에 따라 값이 달라지는 색상 변수.
 *
 * `{ color: ... }` 로 한 겹 감싼 이유는 변수 이름 때문이다. 감싸지 않으면
 * `--brick-bg-canvas` 가 되어 다른 토큰 계열과 구분이 안 된다.
 */
export const colorVars = createGlobalThemeContract({ color: lightColors }, toVarName);

/** 테마와 무관하게 고정인 변수. `:root` 에 한 번만 깔린다. */
export const baseVars = createGlobalThemeContract(
  { space, radius, fontSize, lineHeight, fontWeight, fontFamily, shadow },
  toVarName,
);

/**
 * 컴포넌트가 실제로 참조하는 단일 진입점.
 *
 * `.css.ts` 안에서 `vars.color.fg.neutral` 처럼 쓰면 `var(--brick-color-fg-neutral)`
 * 문자열로 컴파일된다. 이 파일 자체는 CSS 를 만들어내지 않는다 — 이름만 정의한다.
 */
export const vars = {
  ...colorVars,
  ...baseVars,
};
