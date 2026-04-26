export type DictionaryEntry = {
  meanings?: Array<Record<string, unknown>>;
  phonetics?: Array<{
    audio?: string;
  }>;
};

export function normalizeAudioUrl(audioUrl: string | null | undefined) {
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
