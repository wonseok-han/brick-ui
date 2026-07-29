/**
 * 태그 버전에 해당하는 릴리즈 노트를 만든다.
 *
 * changesets 는 패키지마다 CHANGELOG.md 를 만든다. 모노레포이므로 각 패키지의
 * 해당 버전 섹션을 모아 하나의 노트로 합친다. 어느 패키지에도 섹션이 없으면
 * 이전 태그 이후의 커밋 목록으로 대체한다.
 *
 * 사용: node scripts/release-notes.mjs 0.1.0 > NOTES.md
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const version = process.argv[2];
if (!version) {
  console.error("사용: node scripts/release-notes.mjs <version>");
  process.exit(1);
}

/** @param {string[]} args */
function git(args) {
  try {
    // stderr 를 버린다. 첫 릴리스에는 이전 태그가 없어 describe 가 실패하는데,
    // 그건 정상 경로라 사용자에게 보일 이유가 없다.
    return execFileSync("git", args, {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

/** CHANGELOG.md 에서 `## <version>` 섹션 본문만 뽑는다. */
function extractSection(changelogPath, targetVersion) {
  if (!existsSync(changelogPath)) return "";

  const lines = readFileSync(changelogPath, "utf8").split("\n");
  const start = lines.findIndex((line) => line.trim() === `## ${targetVersion}`);
  if (start === -1) return "";

  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith("## "));

  return (end === -1 ? rest : rest.slice(0, end)).join("\n").trim();
}

const packagesDir = join(repoRoot, "packages");
const publishable = readdirSync(packagesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(packagesDir, entry.name))
  .filter((dir) => existsSync(join(dir, "package.json")))
  .map((dir) => ({
    pkg: JSON.parse(readFileSync(join(dir, "package.json"), "utf8")),
    body: extractSection(join(dir, "CHANGELOG.md"), version),
  }))
  .filter(({ pkg }) => !pkg.private);

const sections = publishable
  .filter(({ body }) => body.length > 0)
  .map(({ pkg, body }) => `### ${pkg.name}\n\n${body}`);

const tag = `v${version}`;
const previousTag = git(["describe", "--tags", "--abbrev=0", `${tag}^`]);

const output = [];

if (sections.length > 0) {
  output.push(sections.join("\n\n"));
} else {
  // CHANGELOG 에 해당 버전 섹션이 없으면 커밋 목록으로 대체한다.
  const range = previousTag ? `${previousTag}..${tag}` : tag;
  const commits = git(["log", "--no-merges", "--pretty=- %s", range]);
  output.push(`### Commits\n\n${commits || "- (변경 내역 없음)"}`);
}

if (previousTag) {
  const repo = process.env["GITHUB_REPOSITORY"] ?? "wonseok-han/brick-ui";
  output.push(`**Full Changelog**: https://github.com/${repo}/compare/${previousTag}...${tag}`);
}

output.push(
  publishable
    .map(({ pkg }) => `📦 https://www.npmjs.com/package/${pkg.name}/v/${version}`)
    .join("\n"),
);

console.log(output.join("\n\n"));
