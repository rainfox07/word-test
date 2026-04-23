import { env } from "./env";

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

    return audio || null;
  } catch {
    return null;
  }
}
