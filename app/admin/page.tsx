import { AdminAuthForm } from "@/components/admin/admin-auth-form";
import { AdminPanel } from "@/components/admin/admin-panel";
import { hasAdminAccess } from "@/lib/admin-auth";
import { getAdminDashboardData } from "@/lib/admin-data";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ sort?: string }>;
}) {
  const isAuthenticated = await hasAdminAccess();

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <AdminAuthForm />
      </div>
    );
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const sortBy = resolvedSearchParams?.sort === "accuracy" ? "accuracy" : "practice";
  const data = await getAdminDashboardData(sortBy);

  return <AdminPanel data={data} />;
}
