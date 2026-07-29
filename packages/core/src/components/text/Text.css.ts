import { recipe } from "@vanilla-extract/recipes";
import type { RecipeVariants } from "@vanilla-extract/recipes";

import { vars } from "@brick/tokens";

export const text = recipe({
  base: {
    margin: 0,
    fontFamily: vars.fontFamily.sans,
    color: vars.color.fg.neutral,
    // 말줄임이 동작하려면 컨테이너가 줄어들 수 있어야 한다. flex 자식일 때
    // min-width:auto 때문에 넘치는 문제를 여기서 미리 막는다.
    minWidth: 0,
  },

  variants: {
    /** `fontSize` 와 `lineHeight` 를 함께 집는다. 따로 두면 반드시 어긋난다. */
    size: {
      xs: { fontSize: vars.fontSize.xs, lineHeight: vars.lineHeight.xs },
      sm: { fontSize: vars.fontSize.sm, lineHeight: vars.lineHeight.sm },
      md: { fontSize: vars.fontSize.md, lineHeight: vars.lineHeight.md },
      lg: { fontSize: vars.fontSize.lg, lineHeight: vars.lineHeight.lg },
      xl: { fontSize: vars.fontSize.xl, lineHeight: vars.lineHeight.xl },
      "2xl": { fontSize: vars.fontSize["2xl"], lineHeight: vars.lineHeight["2xl"] },
      "3xl": { fontSize: vars.fontSize["3xl"], lineHeight: vars.lineHeight["3xl"] },
      "4xl": { fontSize: vars.fontSize["4xl"], lineHeight: vars.lineHeight["4xl"] },
    },

    weight: {
      regular: { fontWeight: vars.fontWeight.regular },
      medium: { fontWeight: vars.fontWeight.medium },
      semibold: { fontWeight: vars.fontWeight.semibold },
      bold: { fontWeight: vars.fontWeight.bold },
    },

    tone: {
      neutral: { color: vars.color.fg.neutral },
      subtle: { color: vars.color.fg.subtle },
      muted: { color: vars.color.fg.muted },
      inverse: { color: vars.color.fg.inverse },
      brand: { color: vars.color.brand.fg },
      danger: { color: vars.color.danger.fg },
      success: { color: vars.color.success.fg },
      warning: { color: vars.color.warning.fg },
    },

    align: {
      left: { textAlign: "left" },
      center: { textAlign: "center" },
      right: { textAlign: "right" },
    },

    /** 한 줄 말줄임. 이 라이브러리가 존재하는 이유 중 하나다. */
    truncate: {
      true: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    },

    /**
     * 여러 줄 말줄임. `truncate` 와 동시에 쓰지 않는다.
     * `-webkit-` 접두사지만 모든 주요 브라우저가 지원한다.
     */
    lineClamp: {
      2: { display: "-webkit-box", WebkitLineClamp: 2 },
      3: { display: "-webkit-box", WebkitLineClamp: 3 },
      4: { display: "-webkit-box", WebkitLineClamp: 4 },
    },
  },

  compoundVariants: [
    {
      variants: { lineClamp: 2 },
      style: { WebkitBoxOrient: "vertical", overflow: "hidden" },
    },
    {
      variants: { lineClamp: 3 },
      style: { WebkitBoxOrient: "vertical", overflow: "hidden" },
    },
    {
      variants: { lineClamp: 4 },
      style: { WebkitBoxOrient: "vertical", overflow: "hidden" },
    },
  ],

  defaultVariants: {
    size: "md",
    weight: "regular",
    tone: "neutral",
  },
});

export type TextVariants = RecipeVariants<typeof text>;
