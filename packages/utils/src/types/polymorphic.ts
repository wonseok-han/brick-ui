import type {
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  ElementType,
  ReactElement,
  Ref,
} from "react";

/** `as` prop 자체. */
type AsProp<TElement extends ElementType> = { as?: TElement };

/**
 * 렌더링 대상 태그의 props 와 컴포넌트가 직접 정의한 props 를 합친다.
 *
 * 겹치는 키는 우리 쪽(`TOwn`)이 이긴다. 예를 들어 Text 가 `color` 를 자체 variant 로
 * 정의했다면, `as="div"` 일 때 딸려오는 HTML `color` 속성은 제거된다. 안 그러면
 * 두 타입이 충돌해 `never` 가 되고 아무 값도 넣을 수 없게 된다.
 */
export type PolymorphicProps<TElement extends ElementType, TOwn = object> = TOwn &
  AsProp<TElement> &
  Omit<ComponentPropsWithoutRef<TElement>, keyof TOwn | "as">;

/** 렌더링 대상 태그에 맞는 ref 타입. `as="input"` 이면 `Ref<HTMLInputElement>`. */
export type PolymorphicRef<TElement extends ElementType> = ComponentPropsWithRef<TElement>["ref"];

/**
 * 컴포넌트 **구현부**가 받는 ref 타입.
 *
 * 렌더링 대상이 호출 시점에 정해지므로 구현부에서는 구체 타입을 알 수 없다.
 * `Ref<Element>` 로 좁히면 `<p ref={ref}>` 같은 평범한 전달조차 대입 에러가 나고,
 * `Ref<never>` 로 두면 `mergeRefs` 와 조합할 때 추론이 깨진다.
 * 호출하는 쪽은 `PolymorphicRef<T>` 로 정확한 타입을 받으므로, 느슨함은 이 한 줄에만 갇힌다.
 */
// oxlint-disable-next-line typescript/no-explicit-any
export type PolymorphicRenderRef = Ref<any>;

export type PolymorphicPropsWithRef<TElement extends ElementType, TOwn = object> = PolymorphicProps<
  TElement,
  TOwn
> & {
  ref?: PolymorphicRef<TElement>;
};

/**
 * `as` 를 받는 컴포넌트의 타입.
 *
 * 호출 시그니처를 제네릭으로 두는 게 핵심이다. 그래야 `<Text as="a" href="..." />`
 * 에서 `href` 가 유효하다고 판정되고, `as` 없이 쓰면 `TDefault` 의 props 로 좁혀진다.
 */
export interface PolymorphicComponent<TDefault extends ElementType, TOwn = object> {
  <TElement extends ElementType = TDefault>(
    props: PolymorphicPropsWithRef<TElement, TOwn>,
  ): ReactElement | null;
  displayName?: string;
}
