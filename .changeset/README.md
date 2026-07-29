# Changesets

배포 대상 패키지(`packages/*`)를 변경했다면 changeset을 하나 추가합니다.

```bash
pnpm changeset
```

패키지와 변경 수준(major / minor / patch)을 고르고 요약을 적으면 `.changeset/*.md` 파일이 생깁니다. 이 파일을 변경 사항과 **같은 PR에 포함**시킵니다.

## 이 저장소의 설정

**`linked: [["@brick/*"]]`** — 배포 패키지들이 묶여 있습니다. 하나가 minor 로 올라가면 나머지도 같은 버전으로 맞춰집니다. 소비자가 "@brick 계열은 버전을 맞춰 쓰면 된다"고 이해할 수 있어야 하기 때문입니다.

이름을 나열하지 않고 글롭을 쓴 이유가 있습니다. changesets 는 `linked` 의 모든 이름이 실제로 존재하는지 검증하므로, 아직 만들지 않은 패키지를 미리 적으면 설정 로드 자체가 실패합니다.

`fixed` 가 아니라 `linked` 인 이유는, 변경되지 않은 패키지까지 매번 새 버전을 내보내지는 않기 위해서입니다.

**private 패키지는 자동으로 제외됩니다.** `tooling/*` 와 `apps/*` 는 `private: true` 이므로 `ignore` 에 적을 필요가 없습니다.

## 릴리스 흐름

1. PR 에 changeset 을 포함해서 머지
2. GitHub Actions 가 "Version Packages" PR 을 자동으로 열거나 갱신
3. 그 PR 을 머지하면 npm 에 배포

`NPM_TOKEN` 시크릿이 저장소에 등록되어 있어야 2~3단계가 동작합니다.
