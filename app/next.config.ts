// next.config.ts
const nextConfig = {
  output: 'standalone',                 // App Runner용
  eslint: { ignoreDuringBuilds: true }, // 빌드 중 린트로 멈추지 않게
};
export default nextConfig;
