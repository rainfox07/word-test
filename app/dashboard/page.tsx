import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { requireSession } from "@/lib/auth-session";
import { getDashboardStats } from "@/lib/data";

export default async function DashboardPage() {
  const session = await requireSession();
  const stats = await getDashboardStats(session.user.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <DashboardOverview {...stats} userName={session.user.name} />
    </div>
  );
}
