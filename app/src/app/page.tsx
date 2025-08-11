'use client';

import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Moon, Sun, ChevronRight, Tag, Menu } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Kakao Tech 감성을 참고한 블로그 홈 템플릿
 * - 코드/이미지/브랜드 자산은 일절 복사하지 않고, 레이아웃/UX만 영감으로 재구성
 * - Next.js 페이지 컴포넌트로 사용 가능 (app/page.tsx 혹은 pages/index.tsx)
 * - Tailwind + shadcn/ui + framer-motion + lucide-react
 */

const CATEGORIES = [
  { key: "all", label: "전체" },
  { key: "game", label: "게임" },
  { key: "movie", label: "영화" },
  { key: "opinion", label: "칼럼" },
  { key: "news", label: "소식" },
];

const TAGS = ["Python", "R", "Django", "Next.js", "DB", "공략", "AWS", "정처기", "컴활", "영상편집"];

const MOCK_POSTS = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  title: [
    "[엘든링] 초반 레벨업 동선 총정리",
    "정처기 실기 5단원 핵심 키워드 요약",
    "Next.js ISR로 초고속 블로그 만들기",
    "AWS 비용 최적화: 초보자 가이드",
    "[스타듀밸리] 1년차 수익 동선 템플릿",
    "컴활 1급 함수 조합 20제",
  ][i % 6],
  excerpt:
    "핵심 동선과 체크리스트만 빠르게! 실전에서 바로 쓰는 요약과 표, 그리고 단축키까지 정리했습니다.",
  category: CATEGORIES[(i % (CATEGORIES.length - 1)) + 1].key,
  tags: [TAGS[i % TAGS.length], TAGS[(i + 3) % TAGS.length]],
  date: `2025-0${(i % 8) + 1}-1${i % 9}`,
  readMin: 5 + (i % 7),
}));

function useDarkMode() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(mq.matches);
  }, []);
  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);
  return { dark, setDark };
}

function Header({ onMenu }: { onMenu: () => void }) {
  const { dark, setDark } = useDarkMode();
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur dark:bg-neutral-900/80 dark:border-neutral-800">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
        <button onClick={onMenu} className="lg:hidden p-2 rounded-xl border hover:bg-neutral-50 dark:hover:bg-neutral-800">
          <Menu className="size-5" />
        </button>
        {/* 로고 대체 텍스트 (브랜드 자산 미사용) */}
        <a href="#" className="font-black tracking-tight text-xl md:text-2xl">
          <span className="px-2 py-1 rounded-md bg-yellow-300/90 dark:bg-yellow-400/90 text-neutral-900">Your</span>
          <span className="ml-1">Blog</span>
        </a>
        <nav className="ml-6 hidden lg:flex items-center gap-5 text-sm">
          {CATEGORIES.map((c) => (
            <a key={c.key} href={`#${c.key}`} className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white">
              {c.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setDark(!dark)} className="rounded-xl">
            {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="border-b bg-neutral-50 dark:bg-neutral-950/60 dark:border-neutral-800">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-extrabold tracking-tight">
              기술과 공략을 한 곳에 —
              <span className="ml-2 px-2 py-1 rounded-lg bg-yellow-300/80 dark:bg-yellow-400/80 text-neutral-900">YourBlog</span>
            </motion.h1>
            <p className="mt-3 text-neutral-600 dark:text-neutral-300">
              게임 공략, 공부 기록, 실전 치트시트까지. 빠르게 검색하고 바로 적용하세요.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {TAGS.slice(0, 8).map((t) => (
                <span key={t} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border bg-white dark:bg-neutral-900 dark:border-neutral-800">
                  <Tag className="size-3" /> {t}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="rounded-2xl border bg-white p-3 flex items-center gap-2 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
              <Search className="size-5" />
              <Input className="border-0 focus-visible:ring-0" placeholder="검색: 공략, 정처기, Next.js 등" />
              <Button className="rounded-xl">검색</Button>
            </div>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">예: "정처기 5단원", "엘든링 보스", "컴활 1급 함수"</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PostCard({ post }: { post: typeof MOCK_POSTS[number] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.25 }}>
      <Card className="rounded-2xl overflow-hidden border-neutral-200/70 dark:border-neutral-800">
        <CardContent className="p-0">
          <a href={`/#post-${post.id}`} className="block p-5">
            <div className="text-xs text-neutral-500 dark:text-neutral-400">{new Date(post.date).toLocaleDateString()} · {post.readMin} min</div>
            <h3 className="mt-1 text-lg font-semibold leading-snug hover:underline">{post.title}</h3>
            <p className="mt-2 text-sm text-neutral-600 line-clamp-2 dark:text-neutral-300">{post.excerpt}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span key={t} className="text-[11px] px-2 py-0.5 rounded-full border bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800">#{t}</span>
              ))}
            </div>
          </a>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PostsGrid({ category }: { category: string }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    return MOCK_POSTS.filter((p) => (category === "all" ? true : p.category === category)).filter(
      (p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.join(" ").toLowerCase().includes(query.toLowerCase())
    );
  }, [category, query]);
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="목록 내 검색"
            className="w-full pl-9 pr-3 py-2 rounded-xl border bg-white outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-neutral-900 dark:border-neutral-800"
          />
        </div>
        <Button variant="secondary" className="rounded-xl">필터</Button>
      </div>
      {filtered.length === 0 ? (
        <div className="text-sm text-neutral-500 dark:text-neutral-400">검색 결과가 없어요.</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
      <div className="mt-8 flex items-center justify-end gap-2">
        <Button variant="ghost" className="rounded-xl">이전</Button>
        <Button className="rounded-xl">다음 <ChevronRight className="size-4 ml-1" /></Button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t py-10 bg-white dark:bg-neutral-950 dark:border-neutral-800">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 justify-between">
          <div>
            <div className="font-bold">YourBlog</div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">© {new Date().getFullYear()} YourBlog. All rights reserved.</p>
          </div>
          <div className="flex gap-4 text-sm text-neutral-600 dark:text-neutral-300">
            <a href="#">About</a>
            <a href="#">GitHub</a>
            <a href="#">RSS</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function KakaoInspiredBlog() {
  const [active, setActive] = useState("all");
  const [openMenu, setOpenMenu] = useState(false);
  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
      <Header onMenu={() => setOpenMenu((s) => !s)} />

      {/* 모바일 메뉴 */}
      {openMenu && (
        <div className="lg:hidden border-b bg-white dark:bg-neutral-900 dark:border-neutral-800">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3 flex gap-3 overflow-x-auto">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setActive(c.key)}
                className={`px-3 py-1.5 rounded-xl border text-sm whitespace-nowrap ${
                  active === c.key
                    ? "bg-yellow-300/80 border-yellow-400 text-neutral-900"
                    : "bg-white dark:bg-neutral-900 dark:border-neutral-800"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <Hero />

      {/* 데스크톱 카테고리 탭 */}
      <div className="hidden lg:block border-b bg-white dark:bg-neutral-950 dark:border-neutral-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
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
      </div>

      <PostsGrid category={active} />

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-8">
        <Card className="rounded-2xl border-dashed">
          <CardContent className="p-6 md:p-8">
            <h3 className="text-xl font-semibold">뉴스레터 구독</h3>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">신규 공략과 공부 요약을 메일로 받아보세요.</p>
            <div className="mt-4 flex gap-2 max-w-md">
              <Input placeholder="이메일 입력" />
              <Button className="rounded-xl">구독</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  );
}
