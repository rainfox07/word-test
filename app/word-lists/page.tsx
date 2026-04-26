import Link from "next/link";

import { Card } from "@/components/ui/card";
import { DeleteWordListButton } from "@/components/word-lists/delete-word-list-button";
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

export default async function WordListsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const session = await requireSession();
  const wordLists = await getAccessibleWordListsWithProgress(session.user.id);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const systemLists = wordLists.filter((list) => list.isSystem);
  const ownedLists = wordLists.filter((list) => !list.isSystem);
  const textbookLists: Array<(typeof wordLists)[number]> = [];
  const ownedPageSize = 4;
  const totalOwnedPages = Math.max(1, Math.ceil(ownedLists.length / ownedPageSize));
  const requestedPage = Number(resolvedSearchParams?.page ?? "1");
  const currentOwnedPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(1, requestedPage), totalOwnedPages)
    : 1;
  const paginatedOwnedLists = ownedLists.slice(
    (currentOwnedPage - 1) * ownedPageSize,
    currentOwnedPage * ownedPageSize,
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-brand-700">词库管理</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">默认词库、课本入口与我的词库</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="h-full">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-950">📚 默认词库</h2>
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
            ))}
          </div>
        </Card>

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

        <Card className="h-full">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-950">🗂️ 我的词库</h2>
            <p className="mt-1 text-sm text-slate-500">下方可手动添加和批量导入。</p>
          </div>
          <div className="space-y-4">
            {ownedLists.length ? (
              paginatedOwnedLists.map((list) => (
                <div key={list.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                  <div className="flex flex-col gap-4">
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
                    <div className="flex items-end justify-between gap-3">
                      <Link
                        href={`/test/${list.id}`}
                        className="group inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 hover:text-brand-800"
                      >
                        选择该词库
                        <span className="translate-x-0 text-base transition-transform duration-200 group-hover:translate-x-1">
                          →
                        </span>
                      </Link>
                      <DeleteWordListButton
                        wordListId={list.id}
                        currentPage={currentOwnedPage}
                        currentPageCount={paginatedOwnedLists.length}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
                你还没有自己的词库，可以先在上方创建或导入。
              </div>
            )}
          </div>
          {ownedLists.length > ownedPageSize ? (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <p className="text-xs text-slate-500">
                第 {currentOwnedPage} / {totalOwnedPages} 页
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/word-lists?page=${Math.max(1, currentOwnedPage - 1)}`}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    currentOwnedPage === 1
                      ? "pointer-events-none bg-slate-100 text-slate-400"
                      : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                  }`}
                >
                  上一页
                </Link>
                <Link
                  href={`/word-lists?page=${Math.min(totalOwnedPages, currentOwnedPage + 1)}`}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    currentOwnedPage === totalOwnedPages
                      ? "pointer-events-none bg-slate-100 text-slate-400"
                      : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                  }`}
                >
                  下一页
                </Link>
              </div>
            </div>
          ) : null}
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
