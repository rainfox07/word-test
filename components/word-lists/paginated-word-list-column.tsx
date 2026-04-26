"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { DeleteWordListButton } from "@/components/word-lists/delete-word-list-button";
import { cn } from "@/lib/utils";

type WordListItem = {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  words: Array<{ id: string }>;
  progress: {
    completionRate: number;
  };
};

type PaginatedWordListColumnProps = {
  title: string;
  description: string;
  lists: WordListItem[];
  emptyText: string;
  emptyDescription?: string;
  deletable?: boolean;
};

const PAGE_SIZE = 4;

function getProgressStyle(rate: number) {
  if (rate === 100) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (rate < 20) {
    return "bg-rose-50 text-rose-700";
  }

  return "bg-amber-50 text-amber-700";
}

export function PaginatedWordListColumn({
  title,
  description,
  lists,
  emptyText,
  emptyDescription,
  deletable = false,
}: PaginatedWordListColumnProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(lists.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(Math.max(1, page), totalPages));
  }, [totalPages]);

  const currentLists = useMemo(
    () => lists.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [currentPage, lists],
  );

  const handleDeleted = () => {
    const remainingCount = lists.length - 1;
    const nextTotalPages = Math.max(1, Math.ceil(remainingCount / PAGE_SIZE));

    setCurrentPage((page) => Math.min(page, nextTotalPages));
  };

  return (
    <div className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div className="space-y-4">
        {lists.length ? (
          currentLists.map((list) => (
            <div key={list.id} className="rounded-2xl border border-slate-200 px-4 py-4">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="font-semibold text-slate-950">{list.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {list.description || (list.isSystem ? "系统默认词库" : "自定义词库")}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">{list.words.length} 个单词</p>
                  <div className="mt-3">
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        getProgressStyle(list.progress.completionRate),
                      )}
                    >
                      完成度 {list.progress.completionRate}%
                    </span>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-3">
                  <Link
                    href={`/test/${list.id}`}
                    className="group inline-flex items-center gap-2 rounded-xl border border-transparent bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 transition duration-200 hover:-translate-y-0.5 hover:border-brand-100 hover:bg-brand-100 hover:text-brand-800 hover:shadow-sm"
                  >
                    选择该词库
                    <span className="translate-x-0 text-base transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>

                  {deletable ? (
                    <DeleteWordListButton wordListId={list.id} onDeleted={handleDeleted} />
                  ) : null}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
            <p className="text-base font-semibold text-slate-900">{emptyText}</p>
            {emptyDescription ? (
              <p className="mt-2 text-sm leading-6 text-slate-500">{emptyDescription}</p>
            ) : null}
          </div>
        )}
      </div>

      {lists.length > PAGE_SIZE ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-500">
            第 {currentPage} / {totalPages} 页
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className={cn(
                "rounded-xl px-3 py-2 text-sm font-semibold transition",
                currentPage === 1
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100",
              )}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              上一页
            </button>
            <button
              type="button"
              className={cn(
                "rounded-xl px-3 py-2 text-sm font-semibold transition",
                currentPage === totalPages
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100",
              )}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
            >
              下一页
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
