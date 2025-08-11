'use client';

import React from "react";
import Link from "next/link";
import { Moon, Sun, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

function useDarkMode() {
  const [dark, setDark] = React.useState(false);

  // 초기 모드: OS 다크모드 선호 반영
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(mq.matches);
  }, []);

  // html 클래스 토글
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return { dark, setDark };
}

export default function SiteHeader() {
  const { dark, setDark } = useDarkMode();

  const NAV = [
    { key: "all",            label: "전체",        href: "/" },
    { key: "data_analytics", label: "데이터 분석", href: "/" },
    { key: "developer",      label: "개발",        href: "/" },
    { key: "game",           label: "게임",        href: "/" },
    { key: "movie",          label: "영화",        href: "/" },
    { key: "opinion",        label: "잡담",        href: "/" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur dark:bg-neutral-900/80 dark:border-neutral-800">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
        {/* (옵션) 모바일 메뉴 아이콘 - 드로어는 추후 */}
        <button className="lg:hidden p-2 rounded-xl border hover:bg-neutral-50 dark:hover:bg-neutral-800">
          <Menu className="size-5" />
        </button>

        {/* 로고 */}
        <Link href="/" className="font-black tracking-tight text-xl md:text-2xl">
          <span className="px-2 py-1 rounded-md bg-yellow-300/90 dark:bg-yellow-400/90 text-neutral-900">Your</span>
          <span className="ml-1">Blog</span>
        </Link>

        {/* 데스크톱 내비 */}
        <nav className="ml-6 hidden lg:flex items-center gap-5 text-sm">
          {NAV.map((n) => (
            <Link key={n.key} href={n.href}
              className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white">
              {n.label}
            </Link>
          ))}
        </nav>

        {/* 오른쪽 컨트롤 */}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setDark(v => !v)} className="rounded-xl">
            {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}