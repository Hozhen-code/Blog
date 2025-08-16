import fs from "fs";
import path from "path";
import matter from "gray-matter";

/** 글 메타 타입 */
export type PostMeta = {
  slug: string;
  title: string;
  date: string;            // YYYY-MM-DD
  tags?: string[];
  category?: string;
  excerpt?: string;
  readMin?: number;
};

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, process.env.CONTENT_DIR || "content/posts");

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walk(full));
    else if (/\.(md|mdx)$/i.test(e.name)) files.push(full);
  }
  return files;
}

function fileSlug(abs: string): string {
  const rel = path.relative(POSTS_DIR, abs).replace(/\\/g, "/");
  const noExt = rel.replace(/\.(md|mdx)$/i, "");
  // 슬러그는 마지막 세그먼트(파일명)만 사용
  return noExt.split("/").slice(-1)[0];
}

function computeReadMin(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function toMeta(file: string, content: string, data: Partial<PostMeta> & Record<string, unknown>): PostMeta {
  const fallbackDate = new Date(fs.statSync(file).mtime).toISOString().slice(0, 10);
  return {
    slug: typeof data.slug === "string" && data.slug ? data.slug : fileSlug(file),
    title: typeof data.title === "string" && data.title ? data.title : fileSlug(file),
    date: typeof data.date === "string" && data.date ? data.date : fallbackDate,
    tags: Array.isArray(data.tags) ? data.tags.map((t) => String(t)) : undefined,
    category: typeof data.category === "string" ? data.category : undefined,
    excerpt: typeof data.excerpt === "string" ? data.excerpt : undefined,
    readMin: typeof data.readMin === "number" ? data.readMin : computeReadMin(content),
  };
}

/** 모든 글 메타 로드(정렬: 최신순) */
export function getAllPosts(): PostMeta[] {
  const files = walk(POSTS_DIR);
  const metas = files.map((file) => {
    const raw = fs.readFileSync(file, "utf8");
    const gm = matter(raw);
    return toMeta(file, gm.content, gm.data as Partial<PostMeta> & Record<string, unknown>);
  });
  metas.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return metas;
}

/** 특정 슬러그의 글 원본/메타 */
export function getPostSource(slug: string): { meta: PostMeta; content: string } | null {
  const files = walk(POSTS_DIR);
  const match = files.find((f) => {
    const s = fileSlug(f);
    return s === slug || encodeURIComponent(s) === slug;
  });
  if (!match) return null;

  const raw = fs.readFileSync(match, "utf8");
  const gm = matter(raw);
  const meta = toMeta(match, gm.content, gm.data as Partial<PostMeta> & Record<string, unknown>);
  return { meta, content: gm.content };
}
