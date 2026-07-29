import type { Ref } from "react";

/**
 * 여러 ref 를 하나로 합친다.
 *
 * 컴포넌트가 내부적으로 ref 를 쓰면서 소비자가 넘긴 ref 도 채워줘야 할 때 필요하다.
 * React 는 한 엘리먼트에 ref 를 하나만 붙일 수 있다.
 *
 * @example
 * const innerRef = useRef<HTMLDivElement>(null);
 * return <div ref={mergeRefs(innerRef, forwardedRef)} />;
 */
export function mergeRefs<TInstance>(
  ...refs: (Ref<TInstance> | undefined)[]
): (instance: TInstance | null) => void {
  return (instance) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(instance);
      } else if (ref) {
        // RefObject 의 current 는 타입상 readonly 지만 React 자신도 이렇게 채운다.
        (ref as { current: TInstance | null }).current = instance;
      }
    }
  };
}
