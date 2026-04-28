export const DEFAULT_ACCOUNT_EMAIL = "admin@example.com";

export function normalizeLoginEmail(value: string) {
  const normalized = value.trim().toLowerCase();

  if (normalized === "admin") {
    return DEFAULT_ACCOUNT_EMAIL;
  }

  if (/^1\d{10}$/.test(normalized)) {
    return `phone_${normalized}@local.user`;
  }

  return normalized;
}
