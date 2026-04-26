"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteWordListAction } from "@/app/actions/word-list-actions";
import { Button } from "@/components/ui/button";

export function DeleteWordListButton({
  wordListId,
  currentPage,
  currentPageCount,
}: {
  wordListId: string;
  currentPage: number;
  currentPageCount: number;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-start gap-2 md:items-end">
      <Button
        variant="ghost"
        className="px-2 py-1 text-xs font-medium text-rose-800 hover:bg-rose-50 hover:text-rose-900"
        disabled={isPending}
        onClick={() => {
          const confirmed = window.confirm("确认删除这个词库吗？删除后词库和其中单词将一并移除。");

          if (!confirmed) {
            return;
          }

          startTransition(async () => {
            const result = await deleteWordListAction(wordListId);
            setNotice(result.message);

            if (result.success) {
              if (currentPage > 1 && currentPageCount <= 1) {
                router.replace(`/word-lists?page=${currentPage - 1}`);
                return;
              }

              router.refresh();
            }
          });
        }}
      >
        {isPending ? "删除中..." : "删除词库"}
      </Button>
      {notice ? <p className="text-xs text-slate-500">{notice}</p> : null}
    </div>
  );
}
