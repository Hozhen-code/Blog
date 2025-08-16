import { getAllPosts, getPostSource } from "@/lib/posts";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
// 하이라이트 플러그인은 일단 import만 하고, 켜는지 여부는 런타임에서 제어
import rehypePrettyCode from "rehype-pretty-code";

/** 정적 경로 */
export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: encodeURIComponent(p.slug) }));
}
export const dynamicParams = false;

/** Next 15: params는 Promise 형태 */
export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);

  const post = getPostSource(slug);
  if (!post) notFound();

  const { meta, content } = post;
  const iso = (meta.date || "").slice(0, 10);
  const dateText = iso ? iso.replace(/-/g, ". ") + "." : "";

  // ---- 안전모드: 기본은 OFF. 환경변수 ENABLE_PRETTY=1 일 때만 ON ----
  const prettyEnabled = process.env.ENABLE_PRETTY === "1";
  const rehypePlugins: any[] = [];
  if (prettyEnabled) {
    rehypePlugins.push([
      rehypePrettyCode,
      {
        theme: { light: "github-light", dark: "github-dark" },
        keepBackground: false,
      },
    ]);
  }

  try {
    return (
      <article className="prose dark:prose-invert max-w-3xl mx-auto py-10">
        <h1>{meta.title}</h1>
        <p className="text-sm text-neutral-500">
          {dateText} {meta.readMin ? `· ${meta.readMin} min` : ""}
        </p>

        <MDXRemote
          source={content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins,
            },
          }}
        />
      </article>
    );
  } catch (e) {
    console.error("MDX render error:", e);
    // 최후의 수단: 내용 그대로 노출(렌더 막힘 원인 파악용)
    return (
      <article className="prose dark:prose-invert max-w-3xl mx-auto py-10">
        <h1>{meta.title}</h1>
        <p className="text-sm text-red-500">
          렌더 오류가 있어 코드 하이라이트 없이 원문을 표시합니다.
        </p>
        <pre className="whitespace-pre-wrap text-sm">{content}</pre>
      </article>
    );
  }
}
