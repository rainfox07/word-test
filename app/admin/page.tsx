import { AdminAuthForm } from "@/components/admin/admin-auth-form";
import { AdminPanel } from "@/components/admin/admin-panel";
import { hasAdminAccess } from "@/lib/admin-auth";
import { getAdminDashboardData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ sort?: string; section?: string }>;
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
  const section = resolvedSearchParams?.section;
  const activeSection =
    section === "users" ||
    section === "errors" ||
    section === "word-lists" ||
    section === "activities" ||
    section === "system"
      ? section
      : "overview";
  const data = await getAdminDashboardData(sortBy);

  return <AdminPanel data={data} activeSection={activeSection} />;
}
