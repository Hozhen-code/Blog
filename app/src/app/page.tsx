import HomeClient from "./_components/HomeClient";
import { getAllPosts } from "@/lib/posts";

export const dynamic = "force-static";
export const revalidate = 60;

export default function Page() {
  const posts = getAllPosts();
  return <HomeClient posts={posts} />;
}