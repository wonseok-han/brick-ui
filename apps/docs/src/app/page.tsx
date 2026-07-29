import { Text, sprinkles } from "@brick/core";
import { CheckIcon, ExternalLinkIcon } from "@brick/icons";

/**
 * 이 페이지는 서버 컴포넌트다.
 *
 * `Text` 와 아이콘에 `"use client"` 가 없어도 렌더링된다는 것을 확인하는
 * 역할도 겸한다. Primitive 는 상태가 없으므로 서버에서 그려지는 게 맞다.
 */
export default function HomePage() {
  return (
    <main className={sprinkles({ p: 8, display: "flex", flexDirection: "column", gap: 8 })}>
      <header className={sprinkles({ display: "flex", flexDirection: "column", gap: 2 })}>
        <Text as="h1" size="4xl" weight="bold">
          brick-ui
        </Text>
        <Text size="lg" tone="subtle">
          HTML 기본 태그를 유틸리티 CSS가 적용된 상태로 래핑한 Primitive 컴포넌트
        </Text>
      </header>

      <section className={sprinkles({ display: "flex", flexDirection: "column", gap: 4 })}>
        <Text as="h2" size="2xl" weight="semibold">
          Text
        </Text>

        <div
          className={sprinkles({
            p: 6,
            background: "subtle",
            rounded: "lg",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          })}
        >
          <Text size="3xl" weight="bold">
            size 하나로 font-size와 line-height가 함께 결정됩니다
          </Text>
          <Text tone="subtle">
            둘을 따로 두면 반드시 어긋납니다. 토큰에서 키를 1:1로 맞춰두었습니다.
          </Text>
          <Text truncate>
            truncate를 켜면 한 줄에서 말줄임 처리됩니다. overflow, text-overflow, white-space를 매번
            직접 쓰지 않아도 됩니다.
          </Text>
          <Text lineClamp={2} tone="muted">
            lineClamp는 여러 줄 말줄임입니다. 카드 UI의 설명 영역처럼 높이를 맞춰야 하는 곳에
            씁니다. 이 문단은 충분히 길어서 두 줄을 넘어가고, 넘어간 부분은 잘립니다.
          </Text>
        </div>
      </section>

      <section className={sprinkles({ display: "flex", flexDirection: "column", gap: 4 })}>
        <Text as="h2" size="2xl" weight="semibold">
          Icons
        </Text>

        <div className={sprinkles({ display: "flex", flexDirection: "column", gap: 2 })}>
          <div className={sprinkles({ display: "flex", alignItems: "center", gap: 2 })}>
            <CheckIcon size={20} />
            <Text>색상 prop이 없습니다. CSS의 color를 그대로 따라갑니다</Text>
          </div>
          <Text as="a" href="https://seed-design.io" target="_blank" tone="brand">
            <span className={sprinkles({ display: "inline-flex", alignItems: "center", gap: 1 })}>
              SEED 디자인 시스템
              <ExternalLinkIcon size={16} />
            </span>
          </Text>
        </div>
      </section>

      <section className={sprinkles({ display: "flex", flexDirection: "column", gap: 4 })}>
        <Text as="h2" size="2xl" weight="semibold">
          다크 테마
        </Text>

        <Text tone="subtle">
          {'<html data-theme="dark">'} 로 전환합니다. 컴포넌트는 바뀌지 않고 CSS 변수만
          갈아끼워집니다.
        </Text>

        <div
          data-theme="dark"
          className={sprinkles({
            p: 6,
            background: "canvas",
            rounded: "lg",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          })}
        >
          <Text weight="semibold">이 영역만 다크입니다</Text>
          <Text tone="subtle">data-theme은 어느 엘리먼트에나 걸 수 있습니다</Text>
          <Text tone="danger">danger 톤도 어두운 배경용 값으로 바뀝니다</Text>
        </div>
      </section>
    </main>
  );
}
