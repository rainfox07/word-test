import { DEFAULT_ACCOUNT_EMAIL } from "@/lib/default-account";

const phonePattern = /^1\d{10}$/;
const invitationCodePattern = /^\d{10}$/;

export function isPhoneIdentifier(value: string) {
  return phonePattern.test(value.trim());
}

export function isEmailIdentifier(value: string) {
  return value.includes("@");
}

export function toInternalPhoneEmail(phone: string) {
  return `phone_${phone}@local.user`;
}

export function normalizeIdentifier(value: string) {
  const normalized = value.trim().toLowerCase();

  if (normalized === "admin") {
    return {
      loginValue: DEFAULT_ACCOUNT_EMAIL,
      email: DEFAULT_ACCOUNT_EMAIL,
      phone: null,
      type: "admin" as const,
    };
  }

  if (isPhoneIdentifier(normalized)) {
    return {
      loginValue: toInternalPhoneEmail(normalized),
      email: toInternalPhoneEmail(normalized),
      phone: normalized,
      type: "phone" as const,
    };
  }

  return {
    loginValue: normalized,
    email: normalized,
    phone: null,
    type: isEmailIdentifier(normalized) ? ("email" as const) : ("unknown" as const),
  };
}

export function isValidInvitationCodeFormat(code: string) {
  return invitationCodePattern.test(code.trim());
}

export function isInvitationCodeInRange(code: string) {
  if (!isValidInvitationCodeFormat(code)) {
    return false;
  }

  const numericCode = Number(code);
  return numericCode >= 2510560001 && numericCode <= 2510560300;
}
