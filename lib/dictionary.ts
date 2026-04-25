import { env } from "./env";
import { db } from "@/db";
import { words } from "@/db/schema";
import { eq } from "drizzle-orm";

type DictionaryEntry = {
  meanings?: Array<Record<string, unknown>>;
  phonetics?: Array<{
    audio?: string;
  }>;
};

function normalizeAudioUrl(audioUrl: string | null | undefined) {
  const normalizedValue = audioUrl?.trim();

  if (!normalizedValue) {
    return null;
  }

  return normalizedValue.startsWith("//") ? `https:${normalizedValue}` : normalizedValue;
}

export function extractAudioUrl(payload: DictionaryEntry[]) {
  const queue: unknown[] = [...payload];

  while (queue.length > 0) {
    const current = queue.shift();

    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    if (!current || typeof current !== "object") {
      continue;
    }

    const record = current as Record<string, unknown>;
    const audioUrl = normalizeAudioUrl(typeof record.audio === "string" ? record.audio : null);

    if (audioUrl) {
      return audioUrl;
    }

    Object.values(record).forEach((value) => {
      if (Array.isArray(value) || (value && typeof value === "object")) {
        queue.push(value);
      }
    });
  }

  return null;
}

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
