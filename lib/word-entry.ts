type WordRowLike = {
  word: string;
  meaning: string | null;
  meaningsJson?: string | null;
  acceptedAnswersJson?: string | null;
  phonetic?: string | null;
  partOfSpeech?: string | null;
  pronunciationAudioUrl?: string | null;
};

const meaningSeparators = /[\n,，;；、/|]+/g;

function parseJsonArray(rawValue: string | null | undefined) {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed)
      ? parsed.map((item) => String(item).trim()).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

function dedupe(values: string[]) {
  return [...new Set(values.map((item) => item.trim()).filter(Boolean))];
}

export function normalizeMeanings(input: string | string[]) {
  const source = Array.isArray(input) ? input.join(",") : input;

  return dedupe(
    source
      .split(meaningSeparators)
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

export function normalizeAcceptedAnswers(input: string | string[]) {
  const source = Array.isArray(input) ? input : input.split(/[\n,，;；/|]+/g);

  return dedupe(
    source
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function toStoredWordData(input: {
  displayWord: string;
  meanings: string[];
  acceptedAnswers?: string[];
  phonetic?: string | null;
  partOfSpeech?: string | null;
  pronunciationAudioUrl?: string | null;
}) {
  const normalizedDisplayWord = input.displayWord.trim().toLowerCase();
  const normalizedMeanings = normalizeMeanings(input.meanings);
  const normalizedAcceptedAnswers = normalizeAcceptedAnswers([
    normalizedDisplayWord,
    ...(input.acceptedAnswers ?? []),
  ]);

  return {
    word: normalizedDisplayWord,
    meaning: normalizedMeanings[0] ?? "",
    meaningsJson: JSON.stringify(normalizedMeanings),
    acceptedAnswersJson: JSON.stringify(normalizedAcceptedAnswers),
    phonetic: input.phonetic?.trim() || null,
    partOfSpeech: input.partOfSpeech?.trim() || null,
    pronunciationAudioUrl: input.pronunciationAudioUrl ?? null,
  };
}

export function getWordMeanings(word: Pick<WordRowLike, "meaning" | "meaningsJson">) {
  const structuredMeanings = parseJsonArray(word.meaningsJson);

  if (structuredMeanings.length) {
    return structuredMeanings;
  }

  return normalizeMeanings(word.meaning ?? "");
}

export function getAcceptedAnswers(word: Pick<WordRowLike, "word" | "acceptedAnswersJson">) {
  const structuredAnswers = parseJsonArray(word.acceptedAnswersJson);

  if (structuredAnswers.length) {
    return normalizeAcceptedAnswers(structuredAnswers);
  }

  return normalizeAcceptedAnswers([word.word]);
}

export function getDisplayMeaning(word: Pick<WordRowLike, "meaning" | "meaningsJson">) {
  return getWordMeanings(word).join(" / ");
}

export function toWordView<T extends WordRowLike>(word: T) {
  const meanings = getWordMeanings(word);
  const acceptedAnswers = getAcceptedAnswers(word);

  return {
    ...word,
    displayWord: word.word,
    meanings,
    displayMeaning: meanings.join(" / "),
    acceptedAnswers,
    phonetic: word.phonetic ?? null,
    partOfSpeech: word.partOfSpeech ?? null,
    pronunciationAudioUrl: word.pronunciationAudioUrl ?? null,
  };
}

export function isAcceptedSpelling(word: Pick<WordRowLike, "word" | "acceptedAnswersJson">, answer: string) {
  const normalizedAnswer = answer.trim().toLowerCase().replace(/\s+/g, " ");
  return getAcceptedAnswers(word).includes(normalizedAnswer);
}
