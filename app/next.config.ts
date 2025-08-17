import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 정적 내보내기 활성화: .\out 에 HTML 생성
  output: "export",

  // next/image를 쓴 경우를 대비해 최적화 비활성화 (정적 호스팅 친화)
  images: { unoptimized: true },

  trailingSlash: true,

  // 처음엔 빌드만 통과시키자 (안전빵)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
