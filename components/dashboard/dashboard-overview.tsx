import Link from "next/link";

import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

type DashboardOverviewProps = {
  wordListCount: number;
  wrongWordCount: number;
  recentRecords: Array<{
    id: string;
    word: string;
    meaning: string;
    userAnswer: string;
    isCorrect: boolean;
    answeredAt: string;
    wordListName: string;
  }>;
};

export function DashboardOverview({
  wordListCount,
  wrongWordCount,
  recentRecords,
}: DashboardOverviewProps) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">可学习词库</p>
          <p className="mt-3 text-4xl font-black text-slate-950">{wordListCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">错词数量</p>
          <p className="mt-3 text-4xl font-black text-rose-600">{wrongWordCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">下一步</p>
          <Link href="/word-lists" className="mt-3 inline-block text-lg font-semibold text-brand-700">
            进入词库并开始测试
          </Link>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">最近学习记录</h2>
            <p className="mt-1 text-sm text-slate-500">最近 8 次拼写结果。</p>
          </div>
          <Link href="/mistakes" className="text-sm font-medium text-brand-700 hover:text-brand-600">
            查看错词本
          </Link>
        </div>

        <div className="space-y-3">
          {recentRecords.length ? (
            recentRecords.map((record) => (
              <div
                key={record.id}
                className="flex flex-col gap-2 rounded-2xl border border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-950">
                    {record.word} · {record.meaning}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    你的答案：{record.userAnswer} · 词库：{record.wordListName}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      record.isCorrect
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
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
              还没有学习记录，先去词库页开始一次测试。
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
