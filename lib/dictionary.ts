import { env } from "./env";
import { db } from "@/db";
import { words } from "@/db/schema";
import { eq } from "drizzle-orm";

type DictionaryEntry = {
  phonetics?: Array<{
    audio?: string;
  }>;
};

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
    const audio = payload
      .flatMap((entry) => entry.phonetics ?? [])
      .map((item) => item.audio?.trim())
      .find((value) => Boolean(value));

    if (!audio) {
      return null;
    }

    return audio.startsWith("//") ? `https:${audio}` : audio;
  } catch {
    return null;
  }
}

export async function ensureWordAudioUrl(input: {
  wordId: string;
  word: string;
  currentAudioUrl: string | null;
}) {
  if (input.currentAudioUrl) {
    return input.currentAudioUrl;
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
