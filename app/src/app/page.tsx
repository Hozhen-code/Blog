import HomeClient from "./_components/HomeClient";
import { getAllPosts } from "@/lib/posts";

export const dynamic = "force-static";
export const revalidate = 60;

export default function Page() {
  const posts = getAllPosts().slice(0, 12); // 첫 12개만
  return <HomeClient posts={posts} />;
}
