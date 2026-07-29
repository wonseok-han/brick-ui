/**
 * `src/svg/*.svg` → `src/generated/*.tsx` 코드젠.
 *
 * 산출물은 커밋한다. gitignore 하면 리뷰에서 아이콘 변경을 볼 수 없고,
 * CI 가 codegen 을 먼저 돌려야 빌드되는 순서 의존이 생긴다.
 *
 * 사용:
 *   node scripts/generate.mjs
 *   node scripts/generate.mjs --check   # 산출물이 최신인지만 확인 (CI 용)
 */
import { transform } from "@svgr/core";
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const svgDir = join(pkgRoot, "src/svg");
const outDir = join(pkgRoot, "src/generated");

const checkOnly = process.argv.includes("--check");

/** `chevron-down.svg` → `ChevronDownIcon` */
function toComponentName(fileName) {
  const pascal = basename(fileName, ".svg")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return `${pascal}Icon`;
}

/**
 * 생성될 컴포넌트의 모양을 여기서 고정한다.
 *
 * SVGR 기본 템플릿은 `SVGProps<SVGSVGElement>` 를 그대로 받는 함수 컴포넌트를
 * 만든다. 그러면 아이콘마다 size 처리를 따로 해야 하므로, 공용 `IconProps` 를
 * 쓰도록 템플릿을 직접 준다.
 */
const template = ({ componentName, jsx }, { tpl }) => tpl`
import type { IconProps } from "../types";

export const ${componentName} = ({ size = 24, ...props }: IconProps) => (
  ${jsx}
);
`;

// 파일 시스템 순서는 환경마다 다르다. 정렬해야 생성 결과가 재현 가능하고,
// --check 로 diff 를 비교하는 게 의미를 갖는다.
const svgFiles = readdirSync(svgDir)
  .filter((file) => file.endsWith(".svg"))
  .toSorted();

if (svgFiles.length === 0) {
  console.error("src/svg 에 아이콘이 없다");
  process.exit(1);
}

/** @type {{ path: string, content: string }[]} */
const outputs = [];

for (const file of svgFiles) {
  const componentName = toComponentName(file);
  const svgCode = readFileSync(join(svgDir, file), "utf8");

  const code = await transform(
    svgCode,
    {
      plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
      typescript: true,
      jsxRuntime: "automatic",
      expandProps: "end",
      // size 하나로 가로·세로를 함께 정한다.
      svgProps: { width: "{size}", height: "{size}" },
      template,
      svgoConfig: {
        plugins: [
          {
            name: "preset-default",
            // viewBox 가 없으면 size 를 바꿔도 스케일되지 않는다.
            params: { overrides: { removeViewBox: false } },
          },
        ],
      },
    },
    { componentName },
  );

  outputs.push({ path: join(outDir, `${componentName}.tsx`), content: code });
}

const barrel = svgFiles
  .map((file) => {
    const name = toComponentName(file);
    return `export { ${name} } from "./${name}";`;
  })
  .join("\n");

outputs.push({
  path: join(outDir, "index.ts"),
  content: `// 이 파일은 scripts/generate.mjs 가 생성한다. 직접 수정하지 말 것.\n${barrel}\n`,
});

if (checkOnly) {
  const stale = outputs.filter(
    ({ path, content }) => !existsSync(path) || readFileSync(path, "utf8") !== content,
  );

  if (stale.length > 0) {
    console.error("아이콘 산출물이 최신이 아니다. `pnpm generate` 를 실행하고 커밋할 것:");
    for (const { path } of stale) console.error(`  ${path.replace(pkgRoot, ".")}`);
    process.exit(1);
  }

  console.log(`아이콘 ${svgFiles.length}개 산출물 최신 상태`);
  process.exit(0);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const { path, content } of outputs) writeFileSync(path, content);

console.log(`아이콘 ${svgFiles.length}개 생성:`);
for (const file of svgFiles) console.log(`  ${toComponentName(file)}`);
