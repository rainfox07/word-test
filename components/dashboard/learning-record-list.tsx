import Link from "next/link";

import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

type LearningRecord = {
  id: string;
  word: string;
  meaning: string;
  userAnswer: string;
  isCorrect: boolean;
  answeredAt: string;
  wordListName: string;
};

export function LearningRecordList({
  records,
  emptyText,
  showAllHref,
  title = "保留最近的答题痕迹",
  description = "默认展示最近 5 条，方便你快速回看刚刚学过的内容。",
}: {
  records: LearningRecord[];
  emptyText: string;
  showAllHref?: string;
  title?: string;
  description?: string;
}) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-brand-700">最近学习记录</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        {showAllHref ? (
          <Link href={showAllHref} className="text-sm font-semibold text-brand-700 hover:text-brand-600">
            查看全部
          </Link>
        ) : null}
      </div>

      <div className="space-y-3">
        {records.length ? (
          records.map((record) => (
            <div
              key={record.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-950">
                  {record.word} · {record.meaning}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  你的答案：{record.userAnswer} · 词库：{record.wordListName}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    record.isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {record.isCorrect ? "正确" : "错误"}
                </span>
                <span className="text-sm text-slate-500">{formatDateTime(record.answeredAt)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
            {emptyText}
          </div>
        )}
      </div>
    </Card>
  );
}
