import { getAllPosts, getPostSource } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";

export function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }));
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const { meta, content } = getPostSource(params.slug);
  return (
    <article className="prose dark:prose-invert max-w-3xl mx-auto py-10">
      <h1>{meta.title}</h1>
      <p className="text-sm text-neutral-500">{meta.date} · {meta.readMin} min</p>
      <MDXRemote
        source={content}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [[rehypePrettyCode, { theme: "github-dark" }]],
          },
        }}
      />
    </article>
  );
}