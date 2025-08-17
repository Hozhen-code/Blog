// src/app/page.tsx
import HomeClient from "./_components/HomeClient";
import { getAllPosts } from "@/lib/posts";

// "완전 정적"을 강제해서 S3+CloudFront 내보내기(Next export)와 궁합 좋게
export const dynamic = "error";        // 동적 렌더링 금지
export const revalidate = false;       // 빌드 타임 고정

export default function Page() {
  const posts = getAllPosts();  // content/posts에서 메타 읽어오기(서버 측)
  return <HomeClient posts={posts} />;
}
