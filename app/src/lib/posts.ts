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

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

// helpers
const toISODate = (d: Date) => d.toISOString().slice(0, 10);
const dateFromFilename = (f: string) => (f.match(/^(\d{4}-\d{2}-\d{2})-/)?.[1] ?? null);
const slugFromFilename = (f: string) =>
  (f.match(/^\d{4}-\d{2}-\d{2}-(.+)\.mdx$/)?.[1] ?? f.replace(/\.mdx$/, ""));

function gitCreatedISO(absPath: string): string | null {
  try {
    const out = execSync(`git log --diff-filter=A --follow --format=%aI -1 -- "${absPath}"`, {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
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

export function getAllPosts(): PostMeta[] {
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
  });

  return posts
    .filter((p) => p.published !== false)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostSource(slug: string) {
  const file =
    fs
      .readdirSync(POSTS_DIR)
      .find((f) => slugFromFilename(f) === slug) ?? `${slug}.mdx`;

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
