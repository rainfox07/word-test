"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const freeFeatures = ["最多 5 个自定义词库", "单个词库最多 100 个单词", "基础测试模式"];
const plusFeatures = ["不限词库数量", "单个词库最多 500 个单词", "后续支持支付接口接入", "解锁更多功能（当前为占位展示）"];

export function MembershipPlans() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Card className="border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 shadow-[0_18px_40px_rgba(180,83,9,0.14)]">
        <div className="rounded-3xl border border-amber-300/90 bg-white/65 p-5">
          <div className="inline-flex rounded-full bg-amber-200 px-3 py-1 text-xs font-bold tracking-[0.18em] text-amber-900">
            RECOMMENDED
          </div>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-amber-950">PLUS 至尊版</h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-amber-800">普拉斯用户</p>
        </div>

        <p className="mt-4 text-sm leading-6 text-amber-900/80">
          成为普拉斯用户，享受克拉斯人生！
        </p>

        <div className="mt-4 rounded-2xl border border-amber-300 bg-white/75 px-4 py-4">
          <p className="text-sm text-amber-800">终身价格</p>
          <p className="mt-1 text-4xl font-black tracking-tight text-amber-950">0 元</p>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-white/78 p-4">
          <p className="text-sm font-semibold text-amber-800">会员权益对比</p>
          <div className="mt-3 space-y-3">
            {plusFeatures.map((feature) => (
              <div
                key={feature}
                className="rounded-2xl border border-amber-100 bg-amber-50/75 px-4 py-3 text-sm font-medium text-amber-950"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        <Button
          className="mt-6 w-full bg-amber-500 text-amber-950 hover:bg-amber-400"
          onClick={() => {
            window.alert("不会收同学们的钱的，放心吧。");
          }}
        >
          Subscribe
        </Button>
      </Card>

      <Card className="border-slate-200">
        <p className="text-sm font-medium text-slate-500">免费用户</p>
        <h2 className="mt-2 text-3xl font-black text-slate-950">Free</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">适合体验背单词与基础词库管理。</p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">当前权益</p>
          <div className="mt-3 space-y-3">
            {freeFeatures.map((feature) => (
              <div key={feature} className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                {feature}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
