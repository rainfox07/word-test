"use server";

import { isAdminPassword, setAdminAccessCookie, clearAdminAccessCookie } from "@/lib/admin-auth";

export type AdminAuthResult = {
  success: boolean;
  message: string;
};

export async function adminLoginAction(_: AdminAuthResult, formData: FormData): Promise<AdminAuthResult> {
  const password = formData.get("password")?.toString() ?? "";

  if (!password) {
    return {
      success: false,
      message: "请输入管理员密码",
    };
  }

  if (!isAdminPassword(password)) {
    return {
      success: false,
      message: "管理员密码错误",
    };
  }

  await setAdminAccessCookie();

  return {
    success: true,
    message: "验证通过",
  };
}

export async function adminLogoutAction() {
  await clearAdminAccessCookie();
}
