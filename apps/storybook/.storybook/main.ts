import { resolve } from "node:path";

import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import type { StorybookConfig } from "@storybook/react-vite";
import type { Alias, AliasOptions } from "vite";

/** 저장소 루트 (.storybook → apps/storybook → apps → root) */
const repoRoot = resolve(import.meta.dirname, "../../..");

/**
 * @brick/* 를 dist 가 아니라 src 로 해석한다.
 *
 * 이렇게 해야 컴포넌트와 `.css.ts` 를 고치는 즉시 HMR 이 돈다. dist 를 보게 두면
 * 매번 패키지를 다시 빌드해야 한다. 배포 산출물 검증은 5단계(pnpm pack)에서 따로 한다.
 */
const BRICK_ALIAS_ENTRIES: [find: string, replacement: string][] = [
  ["@brick/core", resolve(repoRoot, "packages/core/src")],
  ["@brick/icons", resolve(repoRoot, "packages/icons/src")],
  ["@brick/tokens", resolve(repoRoot, "packages/tokens/src")],
  ["@brick/utils", resolve(repoRoot, "packages/utils/src")],
];

/**
 * `Array.isArray` 는 `readonly T[]` 를 else 분기에서 배제하지 못한다
 * (시그니처가 `arg is any[]` 이라 readonly 배열이 남는다).
 * 직접 술어를 정의해야 양쪽 분기에서 제대로 좁혀진다.
 */
function isAliasArray(alias: AliasOptions): alias is readonly Alias[] {
  return Array.isArray(alias);
}

/**
 * alias 를 배열 형태로 정규화한다.
 *
 * Vite 의 alias 는 객체와 배열 두 형태를 받는데, 객체 형태는 배열 형태의 설탕이다.
 * 한쪽으로 통일해두면 배열을 객체로 스프레드해서 인덱스가 키가 되는 사고를 원천 차단할 수 있다.
 */
function toAliasArray(alias: AliasOptions | undefined): Alias[] {
  if (alias === undefined) return [];
  if (isAliasArray(alias)) return [...alias];

  return Object.entries(alias).map(([find, replacement]) => ({ find, replacement }));
}

const config: StorybookConfig = {
  // 스토리는 각 패키지의 컴포넌트 옆에 co-locate 한다.
  stories: [`${repoRoot}/packages/*/src/**/*.stories.@(ts|tsx)`],

  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],

  framework: {
    name: "@storybook/react-vite",
    options: {},
  },

  viteFinal(viteConfig) {
    viteConfig.plugins = [...(viteConfig.plugins ?? []), vanillaExtractPlugin()];

    viteConfig.resolve ??= {};
    viteConfig.resolve.alias = [
      ...toAliasArray(viteConfig.resolve.alias),
      ...BRICK_ALIAS_ENTRIES.map(([find, replacement]) => ({ find, replacement })),
    ];

    return viteConfig;
  },
};

export default config;
