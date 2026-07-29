import { globalStyle } from "@vanilla-extract/css";

import { vars } from "@brick/tokens";

/**
 * 최소 리셋.
 *
 * normalize.css 를 통째로 가져오지 않는다. Primitive 컴포넌트가 자기 스타일을
 * 온전히 통제하는 데 필요한 만큼만 건드린다. 소비 프로젝트가 이미 자체 리셋을
 * 갖고 있을 수 있으므로 공격적으로 덮어쓰지 않는 편이 안전하다.
 */

globalStyle("*, *::before, *::after", {
  boxSizing: "border-box",
});

globalStyle("body", {
  margin: 0,
  fontFamily: vars.fontFamily.sans,
  color: vars.color.fg.neutral,
  backgroundColor: vars.color.bg.canvas,
  WebkitFontSmoothing: "antialiased",
});

/** 브라우저 기본 여백 제거. Primitive 가 여백을 명시적으로 다루게 한다. */
globalStyle("h1, h2, h3, h4, h5, h6, p, figure, blockquote, dl, dd", {
  margin: 0,
});

globalStyle("button, input, select, textarea", {
  font: "inherit",
  color: "inherit",
});

globalStyle("img, picture, video, canvas, svg", {
  display: "block",
  maxWidth: "100%",
});
