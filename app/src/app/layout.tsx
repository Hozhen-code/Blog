// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Siteheader from "./_components/Siteheader.tsx";

export const metadata: Metadata = {
  title: "YourBlog",
  description: "Game guides & study notes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Siteheader />
        {children}
      </body>
    </html>
  );
}
