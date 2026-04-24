import Link from "next/link";

import { SignOutButton } from "@/components/layout/sign-out-button";
import { Button } from "@/components/ui/button";

type SiteHeaderProps = {
  user: {
    name: string;
  } | null;
};

const navItems = [
  { href: "/dashboard", label: "仪表盘" },
  { href: "/word-lists", label: "词库管理" },
  { href: "/membership", label: "会员" },
  { href: "/mistakes", label: "错词本" },
];

export function SiteHeader({ user }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-950">
          Word Test
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-slate-600 hover:text-slate-950">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-slate-600 sm:inline">{user.name}</span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">登录</Link>
              </Button>
              <Button asChild>
                <Link href="/register">注册</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
