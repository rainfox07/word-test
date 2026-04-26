import { env } from "./env";
import { db } from "@/db";
import { words } from "@/db/schema";
import { extractAudioUrl, normalizeAudioUrl, type DictionaryEntry } from "@/lib/extract-audio-url";
import { eq } from "drizzle-orm";

export async function fetchPronunciationAudioUrl(word: string) {
  const normalizedWord = word.trim().toLowerCase();

  if (!normalizedWord) {
    return null;
  }

  try {
    const response = await fetch(`${env.dictionaryApiBaseUrl}/${encodeURIComponent(normalizedWord)}`, {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as DictionaryEntry[];
    return extractAudioUrl(payload);
  } catch {
    return null;
  }
}

export async function ensureWordAudioUrl(input: {
  wordId: string;
  word: string;
  currentAudioUrl: string | null;
}) {
  const normalizedCurrentAudioUrl = normalizeAudioUrl(input.currentAudioUrl);

  if (normalizedCurrentAudioUrl) {
    return normalizedCurrentAudioUrl;
  }

  const fetchedAudioUrl = await fetchPronunciationAudioUrl(input.word);

  if (!fetchedAudioUrl) {
    return null;
  }

  await db
    .update(words)
    .set({
      pronunciationAudioUrl: fetchedAudioUrl,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(words.id, input.wordId));

  return fetchedAudioUrl;
}
