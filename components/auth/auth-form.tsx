"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="w-full max-w-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950">
          {mode === "login" ? "登录账户" : "创建账户"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {mode === "login" ? "继续你的拼写练习。" : "注册后可管理自己的词库和学习记录。"}
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);

          const formData = new FormData(event.currentTarget);
          const name = formData.get("name")?.toString().trim();
          const email = formData.get("email")?.toString().trim() ?? "";
          const password = formData.get("password")?.toString() ?? "";

          startTransition(async () => {
            const result =
              mode === "register"
                ? await authClient.signUp.email({
                    name: name ?? "",
                    email,
                    password,
                  })
                : await authClient.signIn.email({
                    email,
                    password,
                  });

            if (result.error) {
              setError(result.error.message ?? "操作失败，请稍后重试");
              return;
            }

            router.push("/dashboard");
            router.refresh();
          });
        }}
      >
        {mode === "register" ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">昵称</span>
            <Input name="name" placeholder="例如：Rain" required />
          </label>
        ) : null}

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">邮箱</span>
          <Input name="email" type="email" placeholder="you@example.com" required />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">密码</span>
          <Input name="password" type="password" placeholder="至少 8 位" required minLength={8} />
        </label>

        {error ? (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
        ) : null}

        <Button className="w-full" type="submit" disabled={isPending}>
          {isPending ? "提交中..." : mode === "login" ? "登录" : "注册"}
        </Button>
      </form>

      <p className="mt-4 text-sm text-slate-500">
        {mode === "login" ? "还没有账号？" : "已经有账号？"}
        <Link
          href={mode === "login" ? "/register" : "/login"}
          className="ml-1 font-medium text-brand-700 hover:text-brand-600"
        >
          {mode === "login" ? "去注册" : "去登录"}
        </Link>
      </p>
    </Card>
  );
}
