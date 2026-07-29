import type { Preview } from "@storybook/react-vite";

// 소스의 CSS 엔트리를 직접 끌어온다.
//
// `@brick/tokens/theme.css` 를 쓰면 빌드된 dist 를 보게 되어 HMR 이 끊긴다.
// 그렇다고 `@brick/tokens/theme` 로 쓰면 main.ts 의 alias 덕에 런타임은 되지만
// TypeScript 가 exports 맵에 없는 경로라며 거부한다(TS2882).
// alias 는 Storybook 로컬 편의장치이므로, 여기서도 상대 경로로 솔직하게 가리킨다.
import "../../../packages/tokens/src/theme";
import "../../../packages/core/src/styles";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i },
    },
  },

  // 라이트/다크는 <html data-theme> 로 전환한다. 토큰 설계와 동일한 방식.
  globalTypes: {
    theme: {
      description: "테마",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },

  decorators: [
    (Story, context) => {
      document.documentElement.dataset["theme"] = String(context.globals["theme"] ?? "light");
      return Story();
    },
  ],
};

export default preview;
