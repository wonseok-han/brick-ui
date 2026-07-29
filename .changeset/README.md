# Changesets

배포 대상 패키지(`packages/*`)를 변경했다면 changeset을 하나 추가합니다.

```bash
pnpm changeset
```

패키지와 변경 수준(major / minor / patch)을 고르고 요약을 적으면 `.changeset/*.md` 파일이 생깁니다. 이 파일을 변경 사항과 **같은 PR에 포함**시킵니다.

## 이 저장소의 설정

**`fixed: [["@brick/*"]]`** — 배포 패키지가 **항상 같은 버전**을 갖습니다. 하나가 올라가면 변경되지 않은 패키지도 같이 올라갑니다.

`linked` 가 아니라 `fixed` 인 이유는 릴리스 트리거가 태그이기 때문입니다. `v0.2.0` 태그 하나가 모든 `@brick/*` 를 가리켜야 "태그 = 배포 버전"이 성립합니다. `linked` 는 변경된 패키지만 올려서 버전이 갈라지고, 그러면 태그가 무엇을 뜻하는지 모호해집니다. 부수 효과로 소비자 입장도 단순해집니다 — `@brick/*` 는 전부 같은 버전을 쓰면 됩니다.

이름을 나열하지 않고 **글롭**을 쓴 이유도 있습니다. changesets 는 목록의 모든 이름이 실제로 존재하는지 검증하므로, 아직 만들지 않은 패키지를 미리 적으면 설정 로드 자체가 실패합니다.

**private 패키지는 자동으로 제외됩니다.** `tooling/*` 와 `apps/*` 는 `private: true` 이므로 `ignore` 에 적을 필요가 없습니다.

## 릴리스 흐름

배포는 **태그를 푸시할 때만** 일어납니다. main 에 머지하는 것만으로는 npm 에 아무것도 올라가지 않습니다.

1. PR 에 changeset 을 포함해서 머지
2. `version.yml` 이 "Version Packages" PR 을 열거나 갱신 — **여기서는 배포하지 않습니다**
3. 그 PR 을 머지 (버전과 각 패키지의 `CHANGELOG.md` 가 갱신됨)
4. **사람이 태그를 붙여 푸시**

   ```bash
   git pull
   git tag v0.1.0
   git push origin v0.1.0
   ```

5. `release.yml` 이 빌드 → 산출물 검증 → npm 배포 → GitHub Release 생성

## 배포 전 리허설

```bash
pnpm release:dry
```

빌드부터 `npm publish --dry-run` 까지 실제 경로를 그대로 밟되 발행만 하지 않습니다.

## 인증

**`NPM_TOKEN` 시크릿이 필요 없습니다.** npm Trusted Publishing(OIDC)을 쓰기 때문입니다. 대신 npm 쪽에 이 저장소와 워크플로를 신뢰 발행자로 등록해야 합니다.

npm 패키지 페이지 → Settings → Trusted Publisher 에서 `wonseok-han/brick-ui` 와 `release.yml` 을 등록합니다. 첫 배포 전에는 패키지가 없으므로, 조직/사용자 단위 설정이나 최초 1회 수동 발행이 필요할 수 있습니다.
