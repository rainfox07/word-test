import type { Metadata } from "next";
import Link from "next/link";

import "@/app/globals.css";
import { PageTransition } from "@/components/layout/page-transition";
import { SiteHeader } from "@/components/layout/site-header";
import { getSession } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "克拉斯单词记忆",
  description: "支持听音拼写、词库导入和错词复盘的背单词网站。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="zh-CN">
      <body className="flex min-h-screen flex-col">
        <SiteHeader user={session?.user ? { name: session.user.name } : null} />
        <main className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-1 px-4 py-6 text-center text-sm leading-6 text-slate-500 sm:px-6 lg:px-8">
            <p>&copy; 2026 Lihyu</p>
            <p>Based on Next.js 15 + Drizzle + Better Auth</p>
            <p>
              Github URL :{" "}
              <Link href="https://github.com/rainfox07/word-test" className="hover:text-slate-900">
                https://github.com/rainfox07/word-test
              </Link>
            </p>
            <p>Contact me at Wechat : _3kuxD</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
