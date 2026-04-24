export const DEFAULT_ACCOUNT_EMAIL = "admin@example.com";

export function normalizeLoginEmail(value: string) {
  const normalized = value.trim().toLowerCase();

  if (normalized === "admin") {
    return DEFAULT_ACCOUNT_EMAIL;
  }

  return normalized;
}
