import type { SVGProps } from "react";

/**
 * 모든 아이콘이 공유하는 props.
 *
 * `width`/`height` 를 제거하고 `size` 하나로 통일한다. 아이콘은 정사각형이므로
 * 두 값을 따로 받을 이유가 없고, 따로 받으면 찌그러진 아이콘이 만들어진다.
 *
 * 색상 prop 은 두지 않는다. SVG 내부가 전부 `currentColor` 라서 CSS 의 `color`
 * 를 그대로 따라간다. `<Text tone="danger">` 안에 넣으면 아이콘도 같이 붉어진다.
 */
export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "width" | "height"> {
  /** 가로·세로 크기. 기본값 24 */
  size?: number | string;
}
