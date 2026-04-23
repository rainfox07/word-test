const requiredEnv = ["BETTER_AUTH_SECRET", "BETTER_AUTH_URL", "NEXT_PUBLIC_APP_URL"] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  betterAuthSecret: process.env.BETTER_AUTH_SECRET as string,
  betterAuthUrl: process.env.BETTER_AUTH_URL as string,
  appUrl: process.env.NEXT_PUBLIC_APP_URL as string,
  databaseUrl: process.env.DATABASE_URL ?? "file:./data/word-test.db",
  dictionaryApiBaseUrl:
    process.env.DICTIONARY_API_BASE_URL ?? "https://api.dictionaryapi.dev/api/v2/entries/en",
};
