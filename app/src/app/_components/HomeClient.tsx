'use client';

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PostMeta } from "@/lib/posts";

/** 카테고리 키(글의 frontmatter.category와 일치해야 함) */
const CATEGORIES = [
  { key: "all",            label: "전체" },
  { key: "data_analytics", label: "데이터 분석" },
  { key: "developer",      label: "개발" },
  { key: "game",           label: "게임" },
  { key: "movie",          label: "영화" },
  { key: "opinion",        label: "잡담" },
];

/** Hydration 오류 방지: 로케일/타임존 영향 없는 고정 포맷 */
const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}. ${m}. ${d}.`;
};

function Hero() {
  const TAGS = ["Python","R","Django","Next.js","DB","공략","AWS","정처기"];
  return (
    <section className="border-b bg-neutral-50 dark:bg-neutral-950/60 dark:border-neutral-800">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          기술과 공략을 한 곳에 —
          <span className="ml-2 px-2 py-1 rounded-lg bg-yellow-300/80 dark:bg-yellow-400/80 text-neutral-900">YourBlog</span>
        </h1>
        <p className="mt-3 text-neutral-600 dark:text-neutral-300">
          게임 공략, 공부 기록, 실전 치트시트까지. 빠르게 검색하고 바로 적용하세요.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {TAGS.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border bg-white dark:bg-neutral-900 dark:border-neutral-800">
              <Tag className="size-3" /> {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function PostCard({ post }: { post: PostMeta }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.25 }}>
      <Card className="rounded-2xl overflow-hidden border-neutral-200/70 dark:border-neutral-800">
        <CardContent className="p-0">
          <Link href={`/posts/${post.slug}`} className="block p-5">
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              {formatDate(post.date)} · {post.readMin ?? 5} min
            </div>
            <h3 className="mt-1 text-lg font-semibold leading-snug hover:underline">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="mt-2 text-sm text-neutral-600 line-clamp-2 dark:text-neutral-300">
                {post.excerpt}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {(post.tags ?? []).map((t) => (
                <span key={t} className="text-[11px] px-2 py-0.5 rounded-full border bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800">
                  #{t}
                </span>
              ))}
            </div>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function HomeClient({ posts }: { posts: PostMeta[] }) {
  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const s = query.toLowerCase();
    return posts
      .filter(p => active === "all" ? true : (p.category ?? "etc") === active)
      .filter(p =>
        p.title.toLowerCase().includes(s) ||
        (p.tags?.join(" ").toLowerCase() ?? "").includes(s)
      );
  }, [posts, active, query]);

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
      {/* 전역 헤더는 layout.tsx에서 렌더됩니다 */}
      <Hero />

      {/* 카테고리 탭 */}
      <div className="border-b bg-white dark:bg-neutral-950 dark:border-neutral-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center gap-2">
          {CATEGORIES.map((c) => (
            <Button
              key={c.key}
              variant={active === c.key ? "default" : "secondary"}
              className={`my-3 rounded-xl ${active === c.key ? "bg-yellow-400 text-neutral-900" : ""}`}
              onClick={() => setActive(c.key)}
            >
              {c.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 검색 + 목록 */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="목록 내 검색"
              className="pl-9"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-sm text-neutral-500 dark:text-neutral-400">검색 결과가 없어요.</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t py-10 bg-white dark:bg-neutral-950 dark:border-neutral-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-sm text-neutral-600 dark:text-neutral-300">
          © {new Date().getFullYear()} YourBlog
        </div>
      </footer>
    </div>
  );
}