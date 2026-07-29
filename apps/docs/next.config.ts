import type { NextConfig } from "next";

const config: NextConfig = {
  // @brick/* 는 빌드된 dist 를 그대로 소비한다.
  //
  // Storybook 과 달리 여기서는 transpilePackages 로 소스를 끌어오지 않는다.
  // 문서 사이트가 배포 산출물을 그대로 쓰면, 소비자가 겪을 문제(exports 맵,
  // "use client" 경계, CSS 누락)를 저장소 안에서 상시로 밟게 된다.
  reactStrictMode: true,

  experimental: {
    // TypeScript 7 은 클래식 컴파일러 API 를 exports 에서 제거했다. Next 는 기본적으로
    // 그 API 로 타입 검사를 돌리므로 "does not provide the compiler API" 로 실패한다.
    // 이 옵션을 켜면 API 대신 tsc CLI 를 호출한다.
    // (oxlint / tsc --emitDeclarationOnly 로 갈아탄 것과 같은 계열의 제약이다)
    useTypeScriptCli: true,
  },
};

export default config;
