import type { Metadata } from "next";
import Link from "next/link";

import "@/app/globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { getSession } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Word Test",
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
      <body>
        <SiteHeader user={session?.user ? { name: session.user.name } : null} />
        <main>{children}</main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
            <p>Word Test MVP by Next.js 15 + Drizzle + Better Auth</p>
            <Link href="/word-lists" className="hover:text-slate-900">
              开始管理词库
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
