// next.config.ts
const nextConfig = {
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },            // 빌드 중 ESLint로 멈추지 않게
  experimental: {
    // rehype-pretty-code / shiki가 서버 번들에 제대로 포함되도록
    serverComponentsExternalPackages: ['shiki', 'rehype-pretty-code'],
  },
};
export default nextConfig;
