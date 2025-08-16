import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { execSync } from "child_process";

export type PostMeta = {
  slug: string;
  title: string;
  date: string;               // YYYY-MM-DD
  category?: string;
  tags?: string[];
  excerpt?: string;
  readMin: number;
  published?: boolean;
};

// ── 콘텐츠 경로(환경변수) ────────────────────────────────────────────────
function resolveContentDir(p: string) {
  if (!p) return path.join(process.cwd(), "content", "posts");
  return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
}
const POSTS_DIR = resolveContentDir(process.env.CONTENT_DIR || "");
const INDEX_FILE = path.join(POSTS_DIR, ".index.json");

// ── 유틸 ────────────────────────────────────────────────────────────────
const toISODate = (d: Date) => d.toISOString().slice(0, 10);
const dateFromFilename = (f: string) => (f.match(/^(\d{4}-\d{2}-\d{2})-/)?.[1] ?? null);
const slugFromFilename = (f: string) =>
  (f.match(/^\d{4}-\d{2}-\d{2}-(.+)\.mdx$/)?.[1] ?? f.replace(/\.mdx$/, ""));

function gitCreatedISO(absPath: string): string | null {
  try {
    const out = execSync(`git log --diff-filter=A --follow --format=%aI -1 -- "${absPath}"`, {
      stdio: ["ignore", "pipe", "ignore"],
    }).toString().trim();
    return out || null;
  } catch {
    return null;
  }
}

function makeExcerpt(md: string, limit = 140) {
  const text = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/[#>*_\-\[\]\(\)!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, limit) + (text.length > limit ? "…" : "");
}

// ── 인덱스 빌드/로드(캐시) ─────────────────────────────────────────────
function buildIndex(): PostMeta[] {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
  const posts = files.map((file) => {
    const abs = path.join(POSTS_DIR, file);
    const raw = fs.readFileSync(abs, "utf8");
    const { data, content } = matter(raw);

    const date =
      (data as any).date ??
      dateFromFilename(file) ??
      gitCreatedISO(abs) ??
      toISODate(fs.statSync(abs).birthtime);

    const readMin =
      (data as any).readMin ??
      Math.max(1, Math.round(readingTime(content).minutes));

    const excerpt = (data as any).excerpt ?? makeExcerpt(content);

    return {
      slug: slugFromFilename(file),
      title: (data as any).title ?? slugFromFilename(file),
      date,
      category: (data as any).category ?? "etc",
      tags: (data as any).tags ?? [],
      excerpt,
      readMin,
      published: (data as any).published ?? true,
    } as PostMeta;
  })
  .filter((p) => p.published !== false)
  .sort((a, b) => (a.date < b.date ? 1 : -1));

  fs.writeFileSync(INDEX_FILE, JSON.stringify(posts, null, 2), "utf8");
  return posts;
}

function loadIndex(): PostMeta[] {
  try {
    const idxStat = fs.statSync(INDEX_FILE);
    const mdxFiles = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
    const latestMdx = Math.max(...mdxFiles.map((f) => fs.statSync(path.join(POSTS_DIR, f)).mtimeMs));
    if (idxStat.mtimeMs >= latestMdx) {
      return JSON.parse(fs.readFileSync(INDEX_FILE, "utf8"));
    }
  } catch {
    // index 없거나 오류면 재빌드
  }
  return buildIndex();
}

// ── 공개 API ───────────────────────────────────────────────────────────
export function getAllPosts(): PostMeta[] {
  // 개발/프로덕션 모두 캐시 사용(원하면 dev에서 buildIndex()로 강제 재생성 가능)
  return loadIndex();
}

export function getPostSource(slug: string) {
  const wanted = decodeURIComponent(slug); // 한글/공백 대응

  const file =
    fs.readdirSync(POSTS_DIR).find((f) => {
      const base = slugFromFilename(f);
      return base === wanted || base === slug;
    }) ?? `${wanted}.mdx`;

  const abs = path.join(POSTS_DIR, file);
  const raw = fs.readFileSync(abs, "utf8");
  const { data, content } = matter(raw);

  const date =
    (data as any).date ??
    dateFromFilename(file) ??
    gitCreatedISO(abs) ??
    toISODate(fs.statSync(abs).birthtime);

  const readMin =
    (data as any).readMin ??
    Math.max(1, Math.round(readingTime(content).minutes));

  const excerpt = (data as any).excerpt ?? makeExcerpt(content);

  const meta: PostMeta = {
    slug: slugFromFilename(file),
    title: (data as any).title ?? slugFromFilename(file),
    date,
    category: (data as any).category ?? "etc",
    tags: (data as any).tags ?? [],
    excerpt,
    readMin,
    published: (data as any).published ?? true,
  };

  return { meta, content };
}
