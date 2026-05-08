"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  registerWithInvitationAction,
  resetPasswordWithInvitationAction,
} from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { DEFAULT_ACCOUNT_EMAIL, normalizeLoginEmail } from "@/lib/default-account";
import { isInvitationCodeInRange } from "@/lib/auth-identifiers";
import { cn } from "@/lib/utils";

type AuthFormProps = {
  mode: "login" | "register" | "reset-password";
  verificationChallenge?: {
    prompt: string;
    token: string;
    options: Array<{
      id: string;
      emoji: string;
      label: string;
    }>;
  };
};

export function AuthForm({ mode, verificationChallenge }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedVerificationOption, setSelectedVerificationOption] = useState<string>("");

  const isLoginMode = mode === "login";
  const isRegisterMode = mode === "register";
  const isResetMode = mode === "reset-password";

  return (
    <Card className="w-full max-w-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950">
          {isLoginMode ? "登录账户" : isResetMode ? "忘记密码" : "创建账户"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {isLoginMode
            ? "逸一时，误一世。加油干！"
            : isResetMode
              ? "使用注册时的邀请码和昵称重置密码。"
              : "注册账户 -> 登陆账户 -> 开始学习"}
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          setSuccessMessage(null);

          const formData = new FormData(event.currentTarget);
          const name = formData.get("name")?.toString().trim();
          const rawIdentifier = formData.get("identifier")?.toString().trim() ?? "";
          const loginValue = normalizeLoginEmail(rawIdentifier);
          const password = formData.get("password")?.toString() ?? "";
          const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";
          const invitationCode = formData.get("invitationCode")?.toString().trim() ?? "";

          startTransition(async () => {
            if (isLoginMode) {
              const result = await authClient.signIn.email({
                email: loginValue,
                password,
              });

              if (result.error) {
                setError(result.error.message ?? "操作失败，请稍后重试");
                return;
              }

              router.push("/dashboard");
              router.refresh();
              return;
            }

            if (isRegisterMode) {
              if (!selectedVerificationOption) {
                setError("请先完成人机验证");
                return;
              }

              if (!verificationChallenge?.token) {
                setError("验证题加载失败，请刷新后重试");
                return;
              }

              if (!/^\d{10}$/.test(invitationCode)) {
                setError("无效的邀请码");
                return;
              }

              if (!isInvitationCodeInRange(invitationCode)) {
                setError("无效的邀请码");
                return;
              }

              const result = await registerWithInvitationAction({
                name: name ?? "",
                identifier: rawIdentifier,
                password,
                confirmPassword,
                invitationCode,
                verificationToken: verificationChallenge.token,
                verificationAnswer: selectedVerificationOption,
              });

              if (!result.success || !result.loginValue) {
                setError(result.message);
                return;
              }

              const signInResult = await authClient.signIn.email({
                email: result.loginValue,
                password,
              });

              if (signInResult.error) {
                setError("注册成功，但自动登录失败，请返回登录页手动登录");
                return;
              }

              router.push("/dashboard");
              router.refresh();
              return;
            }

            const result = await resetPasswordWithInvitationAction({
              name: name ?? "",
              invitationCode,
              password,
              confirmPassword,
            });

            if (!result.success) {
              setError(result.message);
              return;
            }

            setSuccessMessage(result.message);
          });
        }}
      >
        {!isLoginMode ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">用户名</span>
            <Input name="name" placeholder={isResetMode ? "注册时使用的昵称" : "或在重置密码中使用到，请牢记"} required />
          </label>
        ) : null}

        {!isResetMode ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">账号</span>
            <Input
              name="identifier"
              type="text"
              placeholder={isLoginMode ? "输入邮箱/手机号" : "输入邮箱或中国大陆标准11位手机号"}
              required
            />
          </label>
        ) : null}

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">{isResetMode ? "新密码" : "密码"}</span>
          <Input name="password" type="password" placeholder="至少八位的密码" required minLength={8} />
        </label>

        {!isLoginMode ? (
          <>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">确认密码</span>
              <Input name="confirmPassword" type="password" placeholder="再次输入密码" required minLength={8} />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                {isResetMode ? "注册时使用的邀请码" : "邀请码"}
              </span>
              <Input
                name="invitationCode"
                type="text"
                inputMode="numeric"
                pattern="\d{10}"
                placeholder="或在重置密码中使用到，请牢记"
                required
              />
            </label>
          </>
        ) : null}

        {isRegisterMode && verificationChallenge ? (
          <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">简单人机验证</p>
              <p className="mt-1 text-sm text-slate-600">{verificationChallenge.prompt}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {verificationChallenge.options.map((option) => {
                const isSelected = selectedVerificationOption === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    className={cn(
                      "rounded-2xl border bg-white px-4 py-4 text-left transition",
                      isSelected
                        ? "border-brand-500 ring-2 ring-brand-200"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-100",
                    )}
                    onClick={() => {
                      setSelectedVerificationOption(option.id);
                      setError(null);
                    }}
                  >
                    <span className="block text-3xl">{option.emoji}</span>
                    <span className="mt-2 block text-sm font-semibold text-slate-700">{option.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500">
              {selectedVerificationOption ? "已选择一个答案，提交时会在服务端再次校验。" : "请先选择正确答案。"}
            </p>
          </div>
        ) : null}

        {error ? (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
        ) : null}
        {successMessage ? (
          <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p>
        ) : null}

        <Button className="w-full" type="submit" disabled={isPending}>
          {isPending ? "提交中..." : isLoginMode ? "登录" : isResetMode ? "重置密码" : "注册"}
        </Button>
      </form>

      <div className="mt-4 space-y-3 text-sm text-slate-500">
        {isResetMode ? (
          <p>
            想起密码了？
            <Link href="/login" className="ml-1 font-medium text-brand-700 hover:text-brand-600">
              返回登录
            </Link>
          </p>
        ) : (
          <p>
            {isLoginMode ? "还没有账号？" : "已经有账号？"}
            <Link
              href={isLoginMode ? "/register" : "/login"}
              className="ml-1 font-medium text-brand-700 hover:text-brand-600"
            >
              {isLoginMode ? "去注册" : "去登录"}
            </Link>
          </p>
        )}

        {isLoginMode ? (
          <p>
            忘记密码？
            <Link href="/forgot-password" className="ml-1 font-medium text-brand-700 hover:text-brand-600">
              去重置
            </Link>
          </p>
        ) : null}
      </div>

      {/* {isLoginMode ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          默认演示账户：<code className="rounded bg-white px-1 py-0.5 text-xs text-slate-900">admin</code> /{" "}
          <code className="rounded bg-white px-1 py-0.5 text-xs text-slate-900">admin</code>
          <br />
          为兼容 Better Auth 的邮箱校验，系统内部实际邮箱为{" "}
          <code className="rounded bg-white px-1 py-0.5 text-xs text-slate-900">{DEFAULT_ACCOUNT_EMAIL}</code>。
          <br />
          手机号登录示例格式：<code className="rounded bg-white px-1 py-0.5 text-xs text-slate-900">18837000038</code>
        </div>
      ) : null} */}
    </Card>
  );
}
