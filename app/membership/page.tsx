import { MembershipPlans } from "@/components/membership/membership-plans";
import { requireSession } from "@/lib/auth-session";

export default async function MembershipPage() {
  await requireSession();

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-brand-700">会员系统</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">会员方案与权益占位</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          当前页面仅为前端占位实现，后续可接支付接口、订阅状态与权益控制。
        </p>
      </div>

      <MembershipPlans />
    </div>
  );
}
