/**
 * 배포 대상 패키지를 npm 에 발행한다.
 *
 * `changeset publish` 를 쓰지 않는다. 배포 트리거를 태그로 두고, 발행 자체는
 * Trusted Publishing(OIDC) + provenance 를 확실히 태우기 위해 `npm publish` 로
 * 직접 한다.
 *
 * 다만 `npm publish` 는 `workspace:^` 프로토콜을 모른다. 그대로 발행하면
 * 소비자가 설치할 수 없는 package.json 이 올라간다. 그래서 `pnpm pack` 으로
 * 프로토콜이 치환된 tarball 을 먼저 만들고, 그 tarball 을 발행한다.
 *
 * 사용:
 *   node scripts/publish-packages.mjs --expect-version 0.1.0
 *   node scripts/publish-packages.mjs --expect-version 0.1.0 --dry-run
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const expectVersion = valueOf("--expect-version");

/** @param {string} flag */
function valueOf(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

/** @param {string} command @param {string[]} commandArgs @param {string} [cwd] */
function run(command, commandArgs, cwd = repoRoot) {
  return execFileSync(command, commandArgs, { cwd, encoding: "utf8", stdio: "pipe" }).trim();
}

/** 배포 대상(= private 이 아닌 packages/*) 을 모은다. */
function collectPackages() {
  const packagesDir = join(repoRoot, "packages");

  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(packagesDir, entry.name))
    .filter((dir) => existsSync(join(dir, "package.json")))
    .map((dir) => ({ dir, pkg: JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) }))
    .filter(({ pkg }) => !pkg.private);
}

/** 이미 레지스트리에 있는 버전인지 확인한다. 재실행해도 안전해야 한다. */
function isAlreadyPublished(name, version) {
  try {
    run("npm", ["view", `${name}@${version}`, "version"]);
    return true;
  } catch {
    // 404(미발행)와 네트워크 오류를 구분하지 않는다. 발행을 시도하면
    // 중복일 경우 npm 이 EPUBLISHCONFLICT 로 막아주므로 안전하다.
    return false;
  }
}

/* ------------------------------------------------------------------ */

const packages = collectPackages();

if (packages.length === 0) {
  console.error("배포 대상 패키지가 없다");
  process.exit(1);
}

// 태그와 실제 버전이 어긋난 채 발행되는 사고를 막는다.
// changesets 의 fixed 설정 덕에 @brick/* 는 항상 같은 버전이어야 한다.
if (expectVersion) {
  const mismatched = packages.filter(({ pkg }) => pkg.version !== expectVersion);

  if (mismatched.length > 0) {
    console.error(`태그 버전(${expectVersion})과 일치하지 않는 패키지가 있다:`);
    for (const { pkg } of mismatched) console.error(`  ${pkg.name}@${pkg.version}`);
    console.error("\n.changeset/config.json 의 fixed 설정이 풀렸거나, 태그를 잘못 달았다.");
    process.exit(1);
  }
}

const packDir = mkdtempSync(join(tmpdir(), "brick-publish-"));
let published = 0;
let skipped = 0;

for (const { dir, pkg } of packages) {
  if (isAlreadyPublished(pkg.name, pkg.version)) {
    console.log(`  - ${pkg.name}@${pkg.version} 이미 발행됨, 건너뜀`);
    skipped += 1;
    continue;
  }

  // pnpm pack 이 workspace:^ 를 실제 버전 범위로 치환해 준다.
  run("pnpm", ["pack", "--pack-destination", packDir], dir);

  const tarball = readdirSync(packDir)
    .map((file) => join(packDir, file))
    .find((file) => file.includes(pkg.name.replace("@", "").replace("/", "-")));

  if (!tarball) {
    console.error(`  ✗ ${pkg.name} tarball 을 찾지 못했다`);
    process.exit(1);
  }

  const publishArgs = ["publish", tarball, "--provenance", "--access", "public"];
  if (dryRun) publishArgs.push("--dry-run");

  try {
    run("npm", publishArgs);
    console.log(`  ✓ ${pkg.name}@${pkg.version}${dryRun ? " (dry-run)" : ""}`);
    published += 1;
  } catch (error) {
    console.error(`  ✗ ${pkg.name}@${pkg.version} 발행 실패`);
    console.error(error.stderr || error.message);
    process.exit(1);
  }
}

console.log(`\n발행 ${published}건, 건너뜀 ${skipped}건${dryRun ? " (dry-run)" : ""}`);
