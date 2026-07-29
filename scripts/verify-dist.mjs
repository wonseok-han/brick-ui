/**
 * 배포 산출물 검증.
 *
 * 이 저장소에서 두 번 겪은 실패가 있다. `sideEffects` 글롭이 부수효과 모듈을
 * 매치하지 못해 트리셰이킹으로 제거되면, **빌드는 성공하고 CSS 파일만 조용히
 * 사라진다.** 에러도 경고도 없다. 그래서 "빌드 성공"은 통과 기준이 될 수 없고,
 * dist 안을 직접 열어봐야 한다. 그 확인을 자동화한 것이 이 스크립트다.
 *
 * 릴리스 전(`pnpm release`)과 CI 에서 실행된다.
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * `--release` 로 실행하면 배포 직전용 검사가 추가된다.
 * CI 의 일반 검증에서는 0.0.0 이 정상이므로 이 검사를 켜지 않는다.
 */
const releaseMode = process.argv.includes("--release");

/** @type {{ name: string, dir: string, checks: Check[] }[]} */
const targets = [
  {
    name: "@brick/tokens",
    dir: "packages/tokens",
    checks: [
      file("dist/index.js"),
      file("dist/index.cjs"),
      file("dist/index.d.ts"),
      file("dist/theme.css", { minBytes: 1000 }),
      contains("dist/theme.css", "--brick-color-fg-neutral", "시맨틱 색상 토큰"),
      contains("dist/theme.css", "[data-theme", "다크 테마 블록"),
      countAtLeast("dist/theme.css", /--brick-[a-z0-9-]+:/g, 60, "CSS 변수"),
      // 이름(index)과 값(theme)의 진입점 분리. index 가 CSS 를 끌어오면
      // core 빌드에 토큰 테마 CSS 가 중복으로 딸려 들어간다.
      notContains("dist/index.js", /from ["'][^"']*\.css["']/, "index 엔트리의 CSS import"),
    ],
  },
  {
    name: "@brick/utils",
    dir: "packages/utils",
    checks: [
      file("dist/index.js"),
      file("dist/index.cjs"),
      file("dist/index.d.ts"),
      // 타입 테스트가 배포물에 새어나가면 안 된다
      absent("dist/types/polymorphic.test-d.d.ts"),
    ],
  },
  {
    name: "@brick/core",
    dir: "packages/core",
    checks: [
      file("dist/index.js"),
      file("dist/index.cjs"),
      file("dist/index.d.ts"),
      file("dist/styles.css", { minBytes: 3000 }),
      contains("dist/styles.css", "var(--brick-", "토큰 참조"),
      contains("dist/styles.css", "text-overflow", "Text 의 truncate 스타일"),
      contains("dist/styles.css", "-webkit-line-clamp", "Text 의 lineClamp 스타일"),
      // 컴포넌트는 원시 팔레트를 직접 쓰지 않는다. 전부 토큰을 거쳐야 한다.
      notContains("dist/styles.css", /#[0-9a-fA-F]{3,8}\b/, "하드코딩된 색상값"),
      // 스토리는 배포물에 포함되지 않는다
      absent("dist/components/text/Text.stories.js"),
    ],
  },
];

/* ------------------------------------------------------------------ */

/** @typedef {(pkgDir: string) => Promise<string | null> | (string | null)} Check */

/** @returns {Check} */
function file(relPath, { minBytes = 1 } = {}) {
  return (pkgDir) => {
    const abs = join(pkgDir, relPath);
    if (!existsSync(abs)) return `${relPath} 없음`;
    const { size } = statSync(abs);
    if (size < minBytes) return `${relPath} 가 너무 작음 (${size}B < ${minBytes}B)`;
    return null;
  };
}

/** @returns {Check} */
function absent(relPath) {
  return (pkgDir) => (existsSync(join(pkgDir, relPath)) ? `${relPath} 가 배포물에 포함됨` : null);
}

/** @returns {Check} */
function contains(relPath, needle, label) {
  return (pkgDir) => {
    const abs = join(pkgDir, relPath);
    if (!existsSync(abs)) return `${relPath} 없음 (${label} 확인 불가)`;
    return readFileSync(abs, "utf8").includes(needle) ? null : `${relPath} 에 ${label} 없음`;
  };
}

/** @returns {Check} */
function notContains(relPath, pattern, label) {
  return (pkgDir) => {
    const abs = join(pkgDir, relPath);
    if (!existsSync(abs)) return `${relPath} 없음`;
    const match = readFileSync(abs, "utf8").match(pattern);
    return match ? `${relPath} 에 ${label} 발견: ${match[0]}` : null;
  };
}

/** @returns {Check} */
function countAtLeast(relPath, pattern, min, label) {
  return (pkgDir) => {
    const abs = join(pkgDir, relPath);
    if (!existsSync(abs)) return `${relPath} 없음`;
    const found = new Set(readFileSync(abs, "utf8").match(pattern) ?? []);
    return found.size >= min ? null : `${relPath} 의 ${label} 이 ${found.size}개 (최소 ${min})`;
  };
}

/** pnpm 스토어 경로가 산출물에 박히면 안 된다. 런타임 의존성을 external 처리하지 않았다는 뜻이다. */
async function checkNoNodeModulesPaths(pkgDir) {
  /** @type {string[]} */
  const leaked = [];

  async function walk(dir, rel = "") {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const childRel = join(rel, entry.name);
      if (entry.name === "node_modules") {
        leaked.push(childRel);
        continue;
      }
      if (entry.isDirectory()) await walk(join(dir, entry.name), childRel);
    }
  }

  const distDir = join(pkgDir, "dist");
  if (existsSync(distDir)) await walk(distDir);

  return leaked.length > 0 ? `dist 에 node_modules 경로 누출: ${leaked.join(", ")}` : null;
}

/**
 * 초기 버전 그대로 배포되는 것을 막는다.
 *
 * changesets/action 은 changeset 이 하나도 없으면 곧바로 publish 를 실행한다.
 * 릴리스 워크플로를 켜둔 상태에서 changeset 없이 main 에 푸시하면 0.0.0 이
 * npm 에 올라가고, npm 배포는 되돌릴 수 없다. 여기서 한 번 더 막는다.
 */
function checkVersionIsReleasable(pkgDir) {
  if (!releaseMode) return null;

  const { version } = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));

  return version === "0.0.0"
    ? `버전이 0.0.0 이다. 배포하려면 먼저 changeset 을 만들어 버전을 올려야 한다`
    : null;
}

/** package.json 의 exports 가 가리키는 파일이 실제로 존재하는지 확인한다. */
function checkExportsResolve(pkgDir) {
  const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
  /** @type {string[]} */
  const missing = [];

  const visit = (value) => {
    if (typeof value === "string") {
      if (value.startsWith("./") && !existsSync(join(pkgDir, value))) missing.push(value);
      return;
    }
    if (value && typeof value === "object") Object.values(value).forEach(visit);
  };

  visit(pkg.exports ?? {});

  return missing.length > 0 ? `exports 대상 파일 없음: ${missing.join(", ")}` : null;
}

/* ------------------------------------------------------------------ */

let failed = 0;

for (const target of targets) {
  const pkgDir = join(repoRoot, target.dir);
  /** @type {string[]} */
  const problems = [];

  for (const check of target.checks) {
    const problem = await check(pkgDir);
    if (problem) problems.push(problem);
  }

  for (const extra of [checkNoNodeModulesPaths, checkExportsResolve, checkVersionIsReleasable]) {
    const problem = await extra(pkgDir);
    if (problem) problems.push(problem);
  }

  if (problems.length === 0) {
    console.log(`  ✓ ${target.name}`);
  } else {
    failed += problems.length;
    console.error(`  ✗ ${target.name}`);
    for (const problem of problems) console.error(`      ${problem}`);
  }
}

if (failed > 0) {
  console.error(`\n배포 산출물 검증 실패: ${failed}건`);
  process.exit(1);
}

console.log("\n배포 산출물 검증 통과");
