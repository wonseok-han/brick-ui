import type { SyntheticEvent } from "react";

export interface ComposeEventHandlersOptions {
  /**
   * 소비자 핸들러가 `preventDefault()` 를 호출했으면 내부 동작을 건너뛴다.
   * 기본값 `true`.
   */
  checkForDefaultPrevented?: boolean;
}

/**
 * 소비자가 넘긴 이벤트 핸들러와 컴포넌트 내부 핸들러를 합친다.
 *
 * 소비자 핸들러를 먼저 호출한다. 그래야 소비자가 `preventDefault()` 로 내부 동작을
 * 취소할 수 있다. 순서를 뒤집으면 취소할 방법이 사라진다.
 *
 * @example
 * <button onClick={composeEventHandlers(props.onClick, () => setOpen(true))} />
 */
export function composeEventHandlers<TEvent extends SyntheticEvent>(
  theirHandler: ((event: TEvent) => void) | undefined,
  ourHandler: (event: TEvent) => void,
  { checkForDefaultPrevented = true }: ComposeEventHandlersOptions = {},
): (event: TEvent) => void {
  return (event) => {
    theirHandler?.(event);

    if (!checkForDefaultPrevented || !event.defaultPrevented) {
      ourHandler(event);
    }
  };
}
