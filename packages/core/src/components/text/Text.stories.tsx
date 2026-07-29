import type { Meta, StoryObj } from "@storybook/react-vite";

import { Text } from "./Text";

const meta: Meta<typeof Text> = {
  title: "Primitives/Text",
  component: Text,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj<typeof Text>;

export const Default: Story = {
  args: {
    children: "기본 텍스트입니다. 별도 설정 없이 p 태그로 렌더링됩니다.",
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {(["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"] as const).map((size) => (
        <Text key={size} size={size}>
          {size} — 다람쥐 헌 쳇바퀴에 타고파
        </Text>
      ))}
    </div>
  ),
};

export const Weights: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {(["regular", "medium", "semibold", "bold"] as const).map((weight) => (
        <Text key={weight} weight={weight} size="lg">
          {weight} — 다람쥐 헌 쳇바퀴에 타고파
        </Text>
      ))}
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {(["neutral", "subtle", "muted", "brand", "danger", "success", "warning"] as const).map(
        (tone) => (
          <Text key={tone} tone={tone}>
            {tone} — 이 색상은 토큰에서 옵니다
          </Text>
        ),
      )}
    </div>
  ),
};

/** 이 라이브러리가 존재하는 이유. 한 줄 말줄임이 기본 제공됩니다. */
export const Truncate: Story = {
  render: () => (
    <div style={{ width: 320, border: "1px dashed #b0b8c1", padding: 12 }}>
      <Text truncate>
        컨테이너를 넘어가는 아주 긴 텍스트입니다. overflow, text-overflow, white-space 를 매번 직접
        쓰지 않아도 truncate 하나로 처리됩니다.
      </Text>
    </div>
  ),
};

/** 여러 줄 말줄임. `truncate` 와 동시에 쓰지 않습니다. */
export const LineClamp: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 320 }}>
      {([2, 3] as const).map((lines) => (
        <div key={lines} style={{ border: "1px dashed #b0b8c1", padding: 12 }}>
          <Text lineClamp={lines}>
            lineClamp={lines} 입니다. 이 문단은 충분히 길어서 지정한 줄 수를 넘어갑니다. 넘어가는
            부분은 말줄임으로 처리되고, 지정한 줄 수까지만 보입니다. 카드 UI 의 설명 영역처럼 높이를
            맞춰야 하는 곳에 씁니다.
          </Text>
        </div>
      ))}
    </div>
  ),
};

/** `as` 로 렌더링할 태그를 바꿔도 타입이 따라옵니다. */
export const PolymorphicAs: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Text as="h1" size="3xl" weight="bold">
        h1 으로 렌더링
      </Text>
      <Text as="span" tone="muted">
        span 으로 렌더링
      </Text>
      <Text as="a" href="https://seed-design.io" target="_blank" tone="brand">
        a 로 렌더링 — href 가 타입상 유효합니다
      </Text>
    </div>
  ),
};
