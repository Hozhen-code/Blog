import fs from "fs";
import path from "path";
import matter from "gray-matter";

/** 글 메타 타입 */
export type PostMeta = {
  slug: string;
  title: string;
  date: string;            // ISO YYYY-MM-DD
  tags?: string[];
  category?: string;
  excerpt?: string;
  readMin?: number;
  thumbnail?: string;
  thumbnailAlt?: string;
  draft?: boolean;         // (published:false 도 draft 취급)
};

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, process.env.CONTENT_DIR || "content/posts");
const PUBLIC_DIR = path.join(ROOT, "public");

// -------------------------------------------------- utils
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
const toPosix = (p: string) => p.replace(/\\/g, "/");

function fileSlug(abs: string): string {
  const rel = toPosix(path.relative(POSTS_DIR, abs));
  const noExt = rel.replace(/\.(md|mdx)$/i, "");
  return noExt.split("/").slice(-1)[0];
}
function dateFromPathOrMTime(file: string): string {
  const p = toPosix(file);
  const m = p.match(/(\d{4})[/-](\d{2})[/-](\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  return new Date(fs.statSync(file).mtime).toISOString().slice(0, 10);
}
function ensureIsoDate(input: string | undefined, file: string): string {
  if (!input) return dateFromPathOrMTime(file);
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return dateFromPathOrMTime(file);
  return d.toISOString().slice(0, 10);
}
function computeReadMin(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
const isHttp = (s: string) => /^https?:\/\//i.test(s);
const leadSlash = (p: string) => (p.startsWith("/") ? p : "/" + p.replace(/^\.?\//, ""));

function deriveExcerpt(md: string): string | undefined {
  const cutoff = md.split("<!--more-->")[0] ?? md;
  const text = cutoff
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_~`>-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return undefined;
  const LIMIT = 180;
  return text.length > LIMIT ? text.slice(0, LIMIT).replace(/\s+\S*$/, "") + "…" : text;
}
const extractFirstH1 = (md: string) => md.match(/^\s*#\s+(.+)\s*$/m)?.[1]?.trim();

// 썸네일 자동 탐지: public/images/<slug>/cover.(png|jpg|jpeg|webp) 우선, 없으면 public/images/<slug>.(확장자)
function findAutoThumbnail(slug: string): string | undefined {
  const candidates: string[] = [];
  const baseDir = path.join(PUBLIC_DIR, "images");
  // /images/<slug>/cover.*
  for (const ext of ["png", "jpg", "jpeg", "webp"]) {
    candidates.push(path.join(baseDir, slug, `cover.${ext}`));
  }
  // /images/<slug>.*
  for (const ext of ["png", "jpg", "jpeg", "webp"]) {
    candidates.push(path.join(baseDir, `${slug}.${ext}`));
  }
  const hit = candidates.find((abs) => fs.existsSync(abs));
  return hit ? leadSlash(toPosix(path.relative(PUBLIC_DIR, hit))) : undefined;
}

// -------------------------------------------------- parse
function toMeta(file: string, content: string, data: Record<string, unknown>): PostMeta {
  const date = ensureIsoDate(typeof data.date === "string" ? data.date : undefined, file);
  const slug = typeof data.slug === "string" && data.slug ? data.slug : fileSlug(file);

  const title =
    typeof data.title === "string" && data.title.trim()
      ? data.title
      : extractFirstH1(content) ?? slug;

  // thumbnail (front-matter 우선)
  let rawThumb: string | undefined;
  if (typeof data.thumbnail === "string") rawThumb = data.thumbnail;
  else if (typeof (data as any).thumb === "string") rawThumb = (data as any).thumb;
  else if (typeof (data as any).cover === "string") rawThumb = (data as any).cover;

  const thumbnail = rawThumb
    ? isHttp(rawThumb) ? rawThumb : leadSlash(rawThumb)
    : findAutoThumbnail(slug);

  const thumbnailAlt =
    typeof (data as any).thumbnailAlt === "string" ? (data as any).thumbnailAlt : undefined;

  const excerpt =
    typeof data.excerpt === "string" && data.excerpt.trim()
      ? data.excerpt
      : deriveExcerpt(content);

  const readMin =
    typeof data.readMin === "number" && Number.isFinite(data.readMin)
      ? data.readMin
      : computeReadMin(content);

  const tags = Array.isArray(data.tags) ? (data.tags as unknown[]).map(String) : undefined;
  const category = typeof data.category === "string" ? data.category : undefined;

  // draft 처리 (draft:true 또는 published:false 를 초안으로 취급)
  const draft =
    (typeof (data as any).draft === "boolean" && (data as any).draft === true) ||
    (typeof (data as any).published === "boolean" && (data as any).published === false);

  return { slug, title, date, tags, category, excerpt, readMin, thumbnail, thumbnailAlt, draft };
}

// -------------------------------------------------- public API
export function getAllPosts(opts?: { includeDrafts?: boolean }): PostMeta[] {
  const includeDrafts = opts?.includeDrafts ?? process.env.NODE_ENV !== "production";
  const files = walk(POSTS_DIR);
  const metas = files.map((file) => {
    const raw = fs.readFileSync(file, "utf8");
    const gm = matter(raw);
    return toMeta(file, gm.content, gm.data as Record<string, unknown>);
  });
  const filtered = includeDrafts ? metas : metas.filter((m) => !m.draft);
  filtered.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return filtered;
}

export function getPostSource(slug: string): { meta: PostMeta; content: string } | null {
  const files = walk(POSTS_DIR);
  const wanted = decodeURIComponent(slug);
  const match = files.find((f) => {
    const s = fileSlug(f);
    return s === wanted || encodeURIComponent(s) === slug;
  });
  if (!match) return null;
  const raw = fs.readFileSync(match, "utf8");
  const gm = matter(raw);
  const meta = toMeta(match, gm.content, gm.data as Record<string, unknown>);
  return { meta, content: gm.content };
}

export function getAllSlugs(opts?: { includeDrafts?: boolean }): string[] {
  return getAllPosts(opts).map((p) => p.slug);
}

export function getAllTagsCount(opts?: { includeDrafts?: boolean }): Array<{ tag: string; count: number }> {
  const map = new Map<string, number>();
  for (const p of getAllPosts(opts)) for (const t of p.tags ?? []) map.set(t, (map.get(t) ?? 0) + 1);
  return Array.from(map.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => (b.count - a.count) || a.tag.localeCompare(b.tag));
}

export const getPostUrl = (slug: string) => `/posts/${encodeURIComponent(slug)}/`;
