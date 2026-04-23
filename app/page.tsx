import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSession } from "@/lib/auth-session";

const features = [
  "支持听音拼写，强化真实听感和拼写记忆",
  "内置默认词库，也支持手动输入与 .txt 导入",
  "自动记录最近测试结果和错词，便于复习回看",
];

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="bg-hero-grid">
      <section className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center">
          <span className="mb-4 inline-flex w-fit rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700">
            听音拼写背单词
          </span>
          <h1 className="max-w-2xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            从音频出发练拼写，而不是只盯着单词表。
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Word Test 为每个用户隔离词库与学习记录，支持登录、导入单词、抽题测试、错词回顾，适合作为背单词网站的清晰 MVP 基线。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="min-w-36">
              <Link href={session?.user ? "/dashboard" : "/register"}>
                {session?.user ? "进入仪表盘" : "开始学习"}
              </Link>
            </Button>
            <Button asChild variant="secondary" className="min-w-36">
              <Link href="/word-lists">查看词库</Link>
            </Button>
          </div>
        </div>

        <Card className="grid gap-4 self-center bg-slate-950 text-white">
          <div>
            <p className="text-sm text-sky-200">学习流程</p>
            <h2 className="mt-2 text-2xl font-bold">导入词库 → 播放音频 → 拼写作答 → 记录结果</h2>
          </div>
          <div className="grid gap-3">
            {features.map((feature) => (
              <div key={feature} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-100">
                {feature}
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
