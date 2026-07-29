/**
 * `@brick/core` 의 공개 API.
 *
 * 스타일은 여기서 딸려오지 않는다. 소비 측에서 한 번만 import 한다.
 *
 * ```ts
 * import "@brick/tokens/theme.css";
 * import "@brick/core/styles.css";
 * ```
 */
export { Text } from "./components/text";
export type { TextOwnProps, TextVariants } from "./components/text";

export { sprinkles } from "./styles/sprinkles.css";
export type { Sprinkles } from "./styles/sprinkles.css";
