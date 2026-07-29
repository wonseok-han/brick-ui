export type ClassValue =
  string | number | null | undefined | false | ClassValue[] | Record<string, unknown>;

/**
 * 클래스명을 합친다.
 *
 * `clsx` 를 의존성으로 넣지 않고 직접 구현한 이유는, Primitive 라이브러리가
 * 런타임 의존성 0개인 편이 소비 측에 부담이 적기 때문이다. 필요한 기능은
 * 문자열/배열/객체 처리와 falsy 제거가 전부다.
 *
 * @example
 * cx("base", isActive && "active", { disabled: isDisabled })
 */
export function cx(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string" || typeof input === "number") {
      classes.push(String(input));
      continue;
    }

    if (Array.isArray(input)) {
      const nested = cx(...input);
      if (nested) classes.push(nested);
      continue;
    }

    for (const [key, value] of Object.entries(input)) {
      if (value) classes.push(key);
    }
  }

  return classes.join(" ");
}
