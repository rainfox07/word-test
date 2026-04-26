import Link from "next/link";

import { Card } from "@/components/ui/card";
import { PaginatedWordListColumn } from "@/components/word-lists/paginated-word-list-column";
import { WordListForms } from "@/components/word-lists/word-list-forms";
import { requireSession } from "@/lib/auth-session";
import { getAccessibleWordListsWithProgress } from "@/lib/data";

export default async function WordListsPage() {
  const session = await requireSession();
  const wordLists = await getAccessibleWordListsWithProgress(session.user.id);

  const systemLists = wordLists.filter((list) => list.isSystem);
  const ownedLists = wordLists.filter((list) => !list.isSystem);
  const textbookLists: Array<(typeof wordLists)[number]> = [];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-brand-700">词库管理</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">默认词库、课本入口与我的词库</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <PaginatedWordListColumn
          title="📚 默认词库"
          description="系统内置内容，可直接进入测试。"
          lists={systemLists}
          emptyText="暂无默认词库"
        />

        <Card className="h-full">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-950">📖 选择课本</h2>
            <p className="mt-1 text-sm text-slate-500">这里预留给后续导入的课本内容，未来可直接像词库一样选择使用。</p>
          </div>

          <div className="space-y-4">
            {textbookLists.length ? (
              textbookLists.map((list) => (
                <div key={list.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">{list.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{list.description || "课本词库"}</p>
                      <p className="mt-2 text-xs text-slate-400">{list.words.length} 个单词</p>
                    </div>
                    <Link
                      href={`/test/${list.id}`}
                      className="group inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 hover:text-brand-800"
                    >
                      选择该词库
                      <span className="translate-x-0 text-base transition-transform duration-200 group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                <p className="text-base font-semibold text-slate-900">暂无课本数据</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">后续可导入课本内容，这里会保留和词库卡片一致的展示结构。</p>
              </div>
            )}
          </div>
        </Card>

        <PaginatedWordListColumn
          title="🗂️ 我的词库"
          description="下方可手动添加和批量导入。"
          lists={ownedLists}
          emptyText="你还没有自己的词库"
          emptyDescription="可以先在下方创建或导入一个新词库。"
          deletable
        />
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
