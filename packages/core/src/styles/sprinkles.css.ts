import { createSprinkles, defineProperties } from "@vanilla-extract/sprinkles";

import { vars } from "@brick/tokens";

/**
 * 유틸리티 CSS 계층.
 *
 * 토큰 값으로만 만들어진 atomic 클래스 모음이다. 컴포넌트가 이걸 조합해서 쓰고,
 * 소비자도 직접 쓸 수 있다. 임의값(`padding: 13px`)은 의도적으로 막는다 —
 * 디자인 시스템의 스케일을 벗어나는 순간 일관성이 무너진다.
 *
 * v0 는 조건부(반응형) 속성이 없다. 브레이크포인트를 넣으면 클래스 수가 배수로
 * 늘어나므로, 실제로 필요해질 때 `conditions` 를 추가한다.
 */

const layoutProperties = defineProperties({
  properties: {
    display: ["none", "block", "inline", "inline-block", "flex", "inline-flex", "grid"],
    flexDirection: ["row", "column", "row-reverse", "column-reverse"],
    flexWrap: ["wrap", "nowrap"],
    alignItems: ["flex-start", "center", "flex-end", "stretch", "baseline"],
    justifyContent: [
      "flex-start",
      "center",
      "flex-end",
      "space-between",
      "space-around",
      "space-evenly",
    ],
    gap: vars.space,
    padding: vars.space,
    paddingTop: vars.space,
    paddingBottom: vars.space,
    paddingLeft: vars.space,
    paddingRight: vars.space,
    margin: vars.space,
    marginTop: vars.space,
    marginBottom: vars.space,
    marginLeft: vars.space,
    marginRight: vars.space,
    borderRadius: vars.radius,
    boxShadow: vars.shadow,
  },
  shorthands: {
    p: ["padding"],
    px: ["paddingLeft", "paddingRight"],
    py: ["paddingTop", "paddingBottom"],
    m: ["margin"],
    mx: ["marginLeft", "marginRight"],
    my: ["marginTop", "marginBottom"],
    rounded: ["borderRadius"],
  },
});

const colorProperties = defineProperties({
  properties: {
    color: vars.color.fg,
    background: vars.color.bg,
    borderColor: vars.color.border,
  },
});

export const sprinkles = createSprinkles(layoutProperties, colorProperties);

export type Sprinkles = Parameters<typeof sprinkles>[0];
