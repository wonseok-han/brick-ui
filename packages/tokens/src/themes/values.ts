import { palette } from "../primitives/palette";

/**
 * 시맨틱 색상 토큰의 형태.
 *
 * 라이트/다크가 이 타입을 공유하므로, 한쪽에만 키를 추가하면 컴파일이 깨진다.
 * 테마 간 누락을 막는 장치다.
 *
 * `interface` 가 아니라 `type` 인 이유: Vanilla Extract 의 `NullableTokens` 는
 * 인덱스 시그니처를 요구하는데, interface 는 암묵적 인덱스 시그니처를 갖지 않아
 * `createGlobalThemeContract` 에 넘길 수 없다.
 */
export type ColorTokens = {
  /** 표면. 뒤에서 앞으로 canvas → layer → subtle/muted 순으로 쌓인다. */
  bg: {
    canvas: string;
    layer: string;
    subtle: string;
    muted: string;
    inverse: string;
  };
  /** 전경(텍스트/아이콘). */
  fg: {
    neutral: string;
    subtle: string;
    muted: string;
    inverse: string;
    /** solid 배경 위에 올라가는 전경색 */
    onSolid: string;
  };
  border: {
    subtle: string;
    default: string;
    strong: string;
  };
  brand: {
    solid: string;
    solidHover: string;
    subtle: string;
    fg: string;
  };
  danger: { solid: string; subtle: string; fg: string };
  success: { solid: string; subtle: string; fg: string };
  warning: { solid: string; subtle: string; fg: string };
};

export const lightColors: ColorTokens = {
  bg: {
    canvas: palette.white,
    layer: palette.white,
    subtle: palette.gray[50],
    muted: palette.gray[100],
    inverse: palette.gray[900],
  },
  fg: {
    neutral: palette.gray[900],
    subtle: palette.gray[700],
    muted: palette.gray[500],
    inverse: palette.white,
    onSolid: palette.white,
  },
  border: {
    subtle: palette.gray[100],
    default: palette.gray[200],
    strong: palette.gray[300],
  },
  brand: {
    solid: palette.blue[600],
    solidHover: palette.blue[700],
    subtle: palette.blue[50],
    fg: palette.blue[700],
  },
  danger: { solid: palette.red[600], subtle: palette.red[50], fg: palette.red[700] },
  success: { solid: palette.green[600], subtle: palette.green[50], fg: palette.green[700] },
  warning: { solid: palette.amber[500], subtle: palette.amber[50], fg: palette.amber[700] },
};

export const darkColors: ColorTokens = {
  bg: {
    canvas: palette.gray[900],
    layer: palette.gray[800],
    subtle: palette.gray[800],
    muted: palette.gray[700],
    inverse: palette.gray[50],
  },
  fg: {
    neutral: palette.gray[50],
    subtle: palette.gray[300],
    muted: palette.gray[400],
    inverse: palette.gray[900],
    onSolid: palette.white,
  },
  border: {
    subtle: palette.gray[800],
    default: palette.gray[700],
    strong: palette.gray[600],
  },
  brand: {
    solid: palette.blue[500],
    solidHover: palette.blue[400],
    subtle: palette.blue[900],
    fg: palette.blue[300],
  },
  danger: { solid: palette.red[500], subtle: palette.red[700], fg: palette.red[500] },
  success: { solid: palette.green[500], subtle: palette.green[700], fg: palette.green[500] },
  warning: { solid: palette.amber[500], subtle: palette.amber[700], fg: palette.amber[500] },
};
