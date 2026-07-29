import type { Metadata } from "next";
import type { ReactNode } from "react";

// 소비 측 진입점은 이 두 줄이 전부다. 문서 사이트가 첫 번째 소비자 역할을 한다.
import "@brick/tokens/theme.css";
import "@brick/core/styles.css";

export const metadata: Metadata = {
  title: "brick-ui",
  description: "HTML 기본 태그를 유틸리티 CSS가 적용된 상태로 래핑한 Primitive 컴포넌트",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
