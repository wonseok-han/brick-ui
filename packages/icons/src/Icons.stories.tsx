import type { Meta, StoryObj } from "@storybook/react-vite";

import * as icons from "./generated";
import { CheckIcon, InfoIcon, WarningIcon } from "./generated";

const meta: Meta = {
  title: "Icons/Overview",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;

type Story = StoryObj;

const entries = Object.entries(icons) as [string, (typeof icons)["CheckIcon"]][];

export const AllIcons: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 24,
      }}
    >
      {entries.map(([name, Icon]) => (
        <div key={name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon style={{ flexShrink: 0 }} />
          <code style={{ fontSize: 13 }}>{name}</code>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<>
  <CheckIcon />
  <InfoIcon />
  <WarningIcon />
</>`,
      },
    },
  },
};

/** `size` 하나로 가로·세로가 함께 정해집니다. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      {[16, 20, 24, 32, 48].map((size) => (
        <div key={size} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <CheckIcon size={size} />
          <code style={{ fontSize: 12 }}>{size}</code>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<div style={{ display: "flex", alignItems: "center", gap: 20 }}>
  <CheckIcon size={16} />
  <CheckIcon size={20} />
  <CheckIcon size={24} />
  <CheckIcon size={32} />
  <CheckIcon size={48} />
</div>`,
      },
    },
  },
};

/**
 * 색상 prop 이 없습니다. SVG 내부가 전부 `currentColor` 라서 CSS 의 `color` 를
 * 그대로 따라갑니다. 부모의 색을 물려받으므로 텍스트와 자연스럽게 어울립니다.
 */
export const InheritsColor: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[
        { label: "기본", color: undefined, Icon: InfoIcon },
        { label: "danger", color: "var(--brick-color-danger-fg)", Icon: WarningIcon },
        { label: "success", color: "var(--brick-color-success-fg)", Icon: CheckIcon },
        { label: "brand", color: "var(--brick-color-brand-fg)", Icon: InfoIcon },
      ].map(({ label, color, Icon }) => (
        <div key={label} style={{ color, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon size={20} />
          <span>{label} — 아이콘과 글자가 같은 색입니다</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<div style={{ color: "var(--brick-color-danger-fg)", display: "flex", gap: 8 }}>
  <WarningIcon size={20} />
  <span>아이콘은 부모의 currentColor를 상속합니다.</span>
</div>`,
      },
    },
  },
};
