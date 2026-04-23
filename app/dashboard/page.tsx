import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { requireSession } from "@/lib/auth-session";
import { getDashboardStats } from "@/lib/data";

export default async function DashboardPage() {
  const session = await requireSession();
  const stats = await getDashboardStats(session.user.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-brand-700">仪表盘</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">欢迎回来，{session.user.name}</h1>
      </div>
      <DashboardOverview {...stats} />
    </div>
  );
}
