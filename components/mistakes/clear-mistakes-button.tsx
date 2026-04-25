"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { clearMistakesAction } from "@/app/actions/test-actions";
import { Button } from "@/components/ui/button";

export function ClearMistakesButton({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="danger"
      disabled={disabled || isPending}
      onClick={() => {
        if (!window.confirm("确认清空当前账户的错题记录吗？此操作不可恢复。")) {
          return;
        }

        startTransition(async () => {
          await clearMistakesAction();
          router.refresh();
        });
      }}
    >
      {isPending ? "清空中..." : "清空错题"}
    </Button>
  );
}
