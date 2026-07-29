/**
 * 타입 레벨 테스트. 런타임 테스트가 아니라 `tsc` 가 통과/실패하는지로 검증한다.
 *
 * `@ts-expect-error` 가 붙은 줄은 **반드시 에러가 나야** 한다. 에러가 사라지면
 * tsc 가 "불필요한 @ts-expect-error" 로 실패시킨다. 즉 타입이 느슨해지는 회귀를
 * 자동으로 잡아준다.
 *
 * 빌드 산출물에는 포함되지 않는다 (tsconfig.build.json 에서 제외).
 */
import { useRef } from "react";

import { forwardRefWithAs } from "../forward-ref-with-as";

type TextOwnProps = {
  truncate?: boolean;
  size?: "sm" | "md";
};

const Text = forwardRefWithAs<"p", TextOwnProps>(({ as, truncate, size, ...rest }, ref) => {
  const Component = as ?? "p";
  return <Component ref={ref} data-truncate={truncate} data-size={size} {...rest} />;
});
Text.displayName = "Text";

/* ------------------------------------------------------------------ */
/* 통과해야 하는 사용법                                                  */
/* ------------------------------------------------------------------ */

/** `as` 없이 쓰면 기본 태그(p)의 props 를 받는다 */
export const defaultTag = <Text className="x">본문</Text>;

/** 자체 정의 props */
export const ownProps = <Text truncate size="sm" />;

/** `as` 로 바꾸면 그 태그의 props 가 열린다 */
export const anchorProps = <Text as="a" href="https://example.com" target="_blank" truncate />;

/** ref 도 `as` 를 따라간다 */
export function RefFollowsAs() {
  const inputRef = useRef<HTMLInputElement>(null);
  return <Text as="input" ref={inputRef} />;
}

/* ------------------------------------------------------------------ */
/* 실패해야 하는 사용법                                                  */
/* ------------------------------------------------------------------ */

// @ts-expect-error href 는 p 태그의 속성이 아니다
export const hrefOnParagraph = <Text href="https://example.com" />;

// @ts-expect-error size 는 "sm" | "md" 만 허용한다
export const badSizeValue = <Text size="xl" />;

// @ts-expect-error a 태그로 바꿔도 input 전용 속성은 못 쓴다
export const inputPropOnAnchor = <Text as="a" value="foo" />;

export function RefTypeMismatch() {
  const divRef = useRef<HTMLDivElement>(null);
  // @ts-expect-error as="input" 인데 div ref 를 넘겼다
  return <Text as="input" ref={divRef} />;
}
