"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const tutorialSteps = [
  { label: "导入词库", tone: "bg-brand-100 text-brand-700" },
  { label: "播放音频", tone: "bg-sky-100 text-sky-700" },
  { label: "拼写作答", tone: "bg-amber-100 text-amber-700" },
  { label: "记录结果", tone: "bg-emerald-100 text-emerald-700" },
];

const cooperationHighlights = ["定制词库", "品牌化页面", "专属功能", "App 打包"];

export function HomeActionModules() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
      <Card className="relative overflow-hidden border-slate-200 bg-white p-0">
        <div className="grid h-full gap-6 p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-brand-700">快速上手</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                不会使用？先看一眼视频教程
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                把导入、听音、拼写和记录这一整套流程快速看一遍，第一次使用会更顺手。
              </p>
            </div>

            <div className="rounded-[1.75rem] bg-slate-950 p-4 text-white shadow-card">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-white/10 text-3xl">
                ▶
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {tutorialSteps.map((step, index) => (
                <div
                  key={step.label}
                  className="rounded-2xl border border-white bg-white px-4 py-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${step.tone}`}>
                      {step.label}
                    </span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-slate-900" style={{ width: `${35 + index * 20}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                新手引导
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                教程入口
              </span>
            </div>
            <Button
              onClick={() => {
                window.alert("视频未录制");
              }}
            >
              查看视频教程
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        <Card className="feature-dark-panel relative overflow-hidden p-6 sm:p-7">
          <div className="absolute right-6 top-6 h-24 w-24 rounded-full bg-amber-300/15 blur-2xl" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="feature-dark-kicker">合作联系</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-white">面向老师与团队的定制入口</h2>
              </div>
              <div className="feature-dark-surface flex h-16 w-16 items-center justify-center text-3xl text-amber-300">
                ⌘
              </div>
            </div>

            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-100">
              如果你需要专属词库、品牌展示、定制页面或教学场景能力，这里是更明确的合作入口。
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {cooperationHighlights.map((item) => (
                <div key={item} className="feature-dark-surface px-4 py-4">
                  <p className="text-sm font-semibold text-white">{item}</p>
                  <p className="mt-1 text-xs leading-6 text-slate-200">更适合学校、团队和定制交付场景</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="border border-amber-200 bg-amber-50/80">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-700">商务合作</p>
              <p className="mt-2 text-base font-semibold text-slate-950">查看合作说明页，了解可定制内容与交付流程。</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                <Link href="/contact">联系我</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/contact">查看合作方案</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
