"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { adminLoginAction, type AdminAuthResult } from "@/app/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const initialState: AdminAuthResult = {
  success: false,
  message: "",
};

export function AdminAuthForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(adminLoginAction, initialState);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <Card className="w-full max-w-md">
      <div className="mb-6">
        <p className="text-sm font-medium text-brand-700">Admin 面板</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">输入管理员密码</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          这个面板用于查看全站用户、学习数据、错误排行和系统状态。
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">管理员密码</span>
          <Input name="password" type="password" placeholder="请输入管理员密码" required />
        </label>

        {state.message ? (
          <p
            className={`rounded-2xl px-4 py-3 text-sm ${
              state.success ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            }`}
          >
            {state.message}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "验证中..." : "进入 Admin 面板"}
        </Button>
      </form>
    </Card>
  );
}
