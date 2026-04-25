import Link from "next/link";

import { Card } from "@/components/ui/card";
import { WordListForms } from "@/components/word-lists/word-list-forms";
import { requireSession } from "@/lib/auth-session";
import { getAccessibleWordListsWithProgress } from "@/lib/data";

function getProgressStyle(rate: number) {
  if (rate === 100) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (rate < 20) {
    return "bg-rose-50 text-rose-700";
  }

  return "bg-amber-50 text-amber-700";
}

export default async function WordListsPage() {
  const session = await requireSession();
  const wordLists = await getAccessibleWordListsWithProgress(session.user.id);

  const systemLists = wordLists.filter((list) => list.isSystem);
  const ownedLists = wordLists.filter((list) => !list.isSystem);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-brand-700">词库管理</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">默认词库与我的词库</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-950">默认词库</h2>
            <p className="mt-1 text-sm text-slate-500">系统内置内容，可直接进入测试。</p>
          </div>
          <div className="space-y-4">
            {systemLists.map((list) => (
              <div key={list.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{list.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{list.description || "系统默认词库"}</p>
                    <p className="mt-2 text-xs text-slate-400">{list.words.length} 个单词</p>
                    <div className="mt-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getProgressStyle(list.progress.completionRate)}`}>
                        完成度 {list.progress.completionRate}%
                      </span>
                    </div>
                  </div>
                  <Link href={`/test/${list.id}`} className="text-sm font-semibold text-brand-700">
                    选择该词库
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-950">我的词库</h2>
            <p className="mt-1 text-sm text-slate-500">下方可手动添加和批量导入。</p>
          </div>
          <div className="space-y-4">
            {ownedLists.length ? (
              ownedLists.map((list) => (
                <div key={list.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">{list.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{list.description || "自定义词库"}</p>
                      <p className="mt-2 text-xs text-slate-400">{list.words.length} 个单词</p>
                      <div className="mt-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getProgressStyle(list.progress.completionRate)}`}>
                          完成度 {list.progress.completionRate}%
                        </span>
                      </div>
                    </div>
                    <Link href={`/test/${list.id}`} className="text-sm font-semibold text-brand-700">
                      选择该词库
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
                你还没有自己的词库，可以先在上方创建或导入。
              </div>
            )}
          </div>
        </Card>
      </div>

      <div>
        <div className="mb-4">
          <p className="text-sm font-medium text-brand-700">创建与导入</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">先学习，后补充词库</h2>
          <p className="mt-2 text-sm text-slate-500">把创建词库和导入操作放到后面，优先展示可以直接开始测试的内容。</p>
        </div>
        <WordListForms ownedWordLists={ownedLists.map((list) => ({ id: list.id, name: list.name }))} />
      </div>
    </div>
  );
}
