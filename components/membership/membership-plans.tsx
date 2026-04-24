import { Card } from "@/components/ui/card";

const freeFeatures = ["最多 5 个自定义词库", "单个词库最多 100 个单词", "基础测试模式"];
const plusFeatures = ["不限词库数量", "单个词库最多 500 个单词", "后续解锁更多高级功能", "优先接入支付后会员权益"];

export function MembershipPlans() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-slate-200">
        <p className="text-sm font-medium text-slate-500">免费用户</p>
        <h2 className="mt-2 text-3xl font-black text-slate-950">Free</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">适合体验背单词与基础词库管理。</p>
        <div className="mt-6 space-y-3">
          {freeFeatures.map((feature) => (
            <div key={feature} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {feature}
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100">
        <p className="text-sm font-semibold tracking-wide text-amber-700">普拉斯用户</p>
        <h2 className="mt-2 text-3xl font-black text-amber-950">PLUS 至尊版</h2>
        <p className="mt-2 text-sm leading-6 text-amber-900/80">
          当前为前端占位方案，后续可接支付接口与会员状态校验。
        </p>
        <div className="mt-4 rounded-2xl border border-amber-300 bg-white/70 px-4 py-4">
          <p className="text-sm text-amber-800">终身价格</p>
          <p className="mt-1 text-4xl font-black tracking-tight text-amber-950">114514 元</p>
        </div>
        <div className="mt-6 space-y-3">
          {plusFeatures.map((feature) => (
            <div key={feature} className="rounded-2xl border border-amber-200 bg-white/70 px-4 py-3 text-sm font-medium text-amber-950">
              {feature}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
