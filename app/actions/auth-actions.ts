"use server";

import { hashPassword } from "better-auth/crypto";
import { and, eq, or } from "drizzle-orm";

import { db } from "@/db";
import { accounts, invitationCodes, users } from "@/db/schema";
import {
  isInvitationCodeInRange,
  isPhoneIdentifier,
  normalizeIdentifier,
} from "@/lib/auth-identifiers";
import { verifyHumanVerificationToken } from "@/lib/human-verification";

export type AuthActionResult = {
  success: boolean;
  message: string;
  loginValue?: string;
};

function validatePassword(password: string) {
  return password.trim().length >= 8;
}

function isReservedPhoneEmail(identifier: string) {
  return /^phone_1\d{10}@local\.user$/i.test(identifier.trim());
}

type RegisterInput = {
  name: string;
  identifier: string;
  password: string;
  confirmPassword: string;
  invitationCode: string;
  verificationToken: string;
  verificationAnswer: string;
};

export async function registerWithInvitationAction(input: RegisterInput): Promise<AuthActionResult> {
  const name = input.name.trim();
  const identifier = input.identifier.trim();
  const invitationCode = input.invitationCode.trim();
  const password = input.password;
  const confirmPassword = input.confirmPassword;

  if (name.length < 2) {
    return { success: false, message: "昵称至少 2 个字符" };
  }

  if (!identifier) {
    return { success: false, message: "请输入邮箱或手机号" };
  }

  const normalized = normalizeIdentifier(identifier);

  if (normalized.type === "unknown") {
    return { success: false, message: "邮箱或手机号格式错误" };
  }

  if (normalized.type === "email" && isReservedPhoneEmail(identifier)) {
    return { success: false, message: "该邮箱格式不可用，请直接使用手机号登录或更换邮箱" };
  }

  if (!validatePassword(password)) {
    return { success: false, message: "密码至少 8 位" };
  }

  if (password !== confirmPassword) {
    return { success: false, message: "两次输入的密码不一致" };
  }

  if (!invitationCode) {
    return { success: false, message: "请输入邀请码" };
  }

  if (!/^\d{10}$/.test(invitationCode)) {
    return { success: false, message: "邀请码格式错误，应为 10 位数字" };
  }

  if (!isInvitationCodeInRange(invitationCode)) {
    return { success: false, message: "邀请码不在可用范围内" };
  }

  if (!input.verificationAnswer) {
    return { success: false, message: "请先完成人机验证" };
  }

  if (!verifyHumanVerificationToken(input.verificationToken, input.verificationAnswer)) {
    return { success: false, message: "人机验证未通过，请重新选择" };
  }

  try {
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();
    const passwordHash = await hashPassword(password);

    await db.transaction(async (tx) => {
      const invitation = await tx.query.invitationCodes.findFirst({
        where: eq(invitationCodes.code, invitationCode),
      });

      if (!invitation) {
        throw new Error("邀请码不存在");
      }

      if (invitation.used) {
        throw new Error("邀请码已被使用");
      }

      const existingUser = await tx.query.users.findFirst({
        where: or(
          eq(users.email, normalized.email),
          normalized.phone ? eq(users.phone, normalized.phone) : eq(users.email, "__never__"),
        ),
      });

      if (existingUser) {
        throw new Error(isPhoneIdentifier(identifier) ? "手机号已被注册" : "邮箱已被注册");
      }

      await tx.insert(users).values({
        id: userId,
        name,
        email: normalized.email,
        phone: normalized.phone,
        emailVerified: normalized.type === "phone",
        image: null,
        createdAt: now,
        updatedAt: now,
      });

      await tx.insert(accounts).values({
        id: crypto.randomUUID(),
        accountId: normalized.email,
        providerId: "credential",
        userId,
        password: passwordHash,
        createdAt: now,
        updatedAt: now,
      });

      const claimedInvitation = await tx
        .update(invitationCodes)
        .set({
          used: true,
          usedByUserId: userId,
          usedAt: now,
        })
        .where(and(eq(invitationCodes.id, invitation.id), eq(invitationCodes.used, false)))
        .returning({ id: invitationCodes.id });

      if (!claimedInvitation.length) {
        throw new Error("邀请码已被使用");
      }
    });

    return {
      success: true,
      message: "注册成功",
      loginValue: normalized.loginValue,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "注册失败，请稍后重试",
    };
  }
}

type ResetPasswordInput = {
  name: string;
  invitationCode: string;
  password: string;
  confirmPassword: string;
};

export async function resetPasswordWithInvitationAction(
  input: ResetPasswordInput,
): Promise<AuthActionResult> {
  const name = input.name.trim();
  const invitationCode = input.invitationCode.trim();
  const password = input.password;
  const confirmPassword = input.confirmPassword;

  if (name.length < 2) {
    return { success: false, message: "请输入注册时使用的昵称" };
  }

  if (!/^\d{10}$/.test(invitationCode) || !isInvitationCodeInRange(invitationCode)) {
    return { success: false, message: "邀请码格式错误" };
  }

  if (!validatePassword(password)) {
    return { success: false, message: "新密码至少 8 位" };
  }

  if (password !== confirmPassword) {
    return { success: false, message: "两次输入的新密码不一致" };
  }

  try {
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    await db.transaction(async (tx) => {
      const invitation = await tx.query.invitationCodes.findFirst({
        where: eq(invitationCodes.code, invitationCode),
      });

      if (!invitation?.usedByUserId) {
        throw new Error("邀请码或用户昵称不匹配");
      }

      const user = await tx.query.users.findFirst({
        where: and(eq(users.id, invitation.usedByUserId), eq(users.name, name)),
      });

      if (!user) {
        throw new Error("邀请码或用户昵称不匹配");
      }

      const account = await tx.query.accounts.findFirst({
        where: and(eq(accounts.userId, user.id), eq(accounts.providerId, "credential")),
      });

      if (!account) {
        throw new Error("该账号暂不支持密码重置");
      }

      await tx
        .update(accounts)
        .set({
          password: passwordHash,
          updatedAt: now,
        })
        .where(eq(accounts.id, account.id));
    });

    return {
      success: true,
      message: "密码已重置，请使用新密码登录",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "重置密码失败，请稍后重试",
    };
  }
}
