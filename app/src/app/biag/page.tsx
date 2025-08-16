import path from "path";
import fs from "fs";
import { getAllPosts, getPostSource } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default function DiagPage() {
  const cwd = process.cwd();
  const contentDir = process.env.CONTENT_DIR || "content/posts";
  const resolved = path.resolve(cwd, contentDir);
  const exists = fs.existsSync(resolved);

  const posts = getAllPosts();
  const first = posts[0];
  const one = first ? getPostSource(first.slug) : null;

  return (
    <pre className="max-w-3xl mx-auto p-4 text-sm overflow-auto">
{`cwd:          ${cwd}
CONTENT_DIR:   ${contentDir}
resolvedPath:  ${resolved}
exists?:       ${exists}
posts count:   ${posts.length}
first slug:    ${first?.slug ?? "-"}
first title:   ${first?.title ?? "-"}

first meta:
${first ? JSON.stringify(one?.meta, null, 2) : "-"}

first content (first 200 chars):
${one ? one.content.slice(0, 200) : "-"}
`}
    </pre>
  );
}
