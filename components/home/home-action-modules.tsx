"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const tutorialSteps = ["导入词库", "播放音频", "拼写作答", "记录结果"];
const feedbackHighlights = ["问题反馈", "功能建议", "学习场景", "内容建议"];

export function HomeActionModules() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
      <Card className="relative overflow-hidden border-slate-200 bg-white p-0">
        <div className="grid h-full gap-5 p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-brand-700">快速上手</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                不会使用？先看一眼视频教程
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                先快速了解导入、听音、拼写和记录的基本流程，第一次使用会更顺手。
              </p>
            </div>

            <div className="rounded-[1.75rem] bg-slate-700 p-4 text-white shadow-card">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-white/10 text-3xl">
                ▶
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {tutorialSteps.map((step, index) => (
              <span
                key={step}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-[10px] text-white">
                  {index + 1}
                </span>
                {step}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
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
                <p className="feature-dark-kicker">反馈与建议</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-white">个人学习工具仍在持续完善中</h2>
              </div>
              <div className="feature-dark-surface flex h-16 w-16 items-center justify-center text-3xl text-amber-300">
                ✦
              </div>
            </div>

            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-100">
              这是一个个人非经营性学习工具项目，目前主要用于单词练习、词库管理和学习辅助。使用过程中遇到问题，
              或希望增加新的学习功能，都可以通过这里提交反馈。
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {feedbackHighlights.map((item) => (
                <span key={item} className="feature-dark-surface px-3 py-2 text-xs font-semibold text-white">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Card>

        <Card className="border border-amber-200 bg-amber-50/80">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-700">反馈入口</p>
              <p className="mt-2 text-base font-semibold text-slate-950">如果你有问题、建议或学习场景反馈，可以从这里提交。</p>
            </div>
            <div className="flex h-full items-center">
              <Button asChild className="bg-slate-700 text-white hover:bg-slate-600">
                <Link href="/contact">提交反馈</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
