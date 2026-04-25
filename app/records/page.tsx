import Link from "next/link";

import { LearningRecordList } from "@/components/dashboard/learning-record-list";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth-session";
import { getRecentLearningRecords } from "@/lib/data";

export default async function RecordsPage() {
  const session = await requireSession();
  const records = await getRecentLearningRecords(session.user.id, 50);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-brand-700">学习记录</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">全部学习记录</h1>
          <p className="mt-2 text-sm text-slate-500">这里保留最近 50 条学习记录，方便你回看近期练习情况。</p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/dashboard">返回仪表盘</Link>
        </Button>
      </div>

      <LearningRecordList
        records={records}
        emptyText="还没有学习记录。"
        title="回看更完整的练习记录"
        description="这里展示最近 50 条学习记录，适合做阶段性复盘。"
      />
    </div>
  );
}
