import type { ElementType } from "react";

import { cx, forwardRefWithAs } from "@brick/utils";

import { text } from "./Text.css";
import type { TextVariants } from "./Text.css";

export type TextOwnProps = NonNullable<TextVariants> & {
  className?: string;
};

/**
 * 텍스트 Primitive.
 *
 * 기본은 `<p>` 이고 `as` 로 바꿀 수 있다. 브라우저 기본 여백이 제거된 상태이며,
 * `size` 하나로 `font-size` 와 `line-height` 가 함께 결정된다.
 *
 * @example
 * <Text>본문</Text>
 * <Text as="h1" size="3xl" weight="bold">제목</Text>
 * <Text truncate>한 줄로 잘리는 긴 텍스트…</Text>
 * <Text lineClamp={2}>두 줄까지만 보이는 텍스트…</Text>
 */
export const Text = forwardRefWithAs<"p", TextOwnProps>(function Text(
  { as, size, weight, tone, align, truncate, lineClamp, className, ...rest },
  ref,
) {
  const Component = (as ?? "p") as ElementType;

  return (
    <Component
      ref={ref}
      className={cx(text({ size, weight, tone, align, truncate, lineClamp }), className)}
      {...rest}
    />
  );
});
