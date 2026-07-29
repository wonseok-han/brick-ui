import { forwardRef } from "react";
import type { ElementType, ReactElement } from "react";

import type {
  PolymorphicComponent,
  PolymorphicProps,
  PolymorphicRenderRef,
} from "./types/polymorphic";

/**
 * `as` 를 받는 컴포넌트를 만든다.
 *
 * `forwardRef` 는 제네릭 컴포넌트의 타입을 보존하지 못한다. 그대로 쓰면 `as` 로
 * 넘긴 태그와 무관하게 props 가 고정돼버린다. 그래서 구현부는 느슨한 타입으로 두고,
 * 반환 타입만 `PolymorphicComponent` 로 단언한다. 캐스팅은 이 함수 안에 한 번만
 * 가둬두고, 사용하는 쪽은 완전한 타입 추론을 받는다.
 *
 * React 19 에서는 `ref` 가 일반 prop 이라 `forwardRef` 없이도 되지만,
 * peer 범위가 `>=18` 이므로 양쪽에서 동작하는 `forwardRef` 를 유지한다.
 *
 * @example
 * type TextOwnProps = { truncate?: boolean };
 *
 * export const Text = forwardRefWithAs<"p", TextOwnProps>(
 *   ({ as, truncate, ...rest }, ref) => {
 *     const Component = as ?? "p";
 *     return <Component ref={ref} {...rest} />;
 *   },
 * );
 * Text.displayName = "Text";
 */
export function forwardRefWithAs<TDefault extends ElementType, TOwn = object>(
  render: (
    props: PolymorphicProps<TDefault, TOwn>,
    ref: PolymorphicRenderRef,
  ) => ReactElement | null,
): PolymorphicComponent<TDefault, TOwn> {
  // 아래 두 캐스팅은 의도적이다. forwardRef 가 제네릭을 삼켜버리는 것을 되돌리는
  // 유일한 방법이고, 이 함수 밖으로는 새어나가지 않는다.
  /* oxlint-disable typescript/no-unsafe-type-assertion */
  return forwardRef(
    render as (props: Record<string, unknown>, ref: PolymorphicRenderRef) => ReactElement | null,
  ) as unknown as PolymorphicComponent<TDefault, TOwn>;
  /* oxlint-enable typescript/no-unsafe-type-assertion */
}
