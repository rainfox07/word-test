import { z } from "zod";
import { normalizeAcceptedAnswers, normalizeMeanings } from "@/lib/word-entry";

const wordPattern = /^[A-Za-z-'\s]+$/;
const importWordPattern = /^[A-Za-z0-9./()&'\-\s]+$/;

export const createWordListSchema = z.object({
  name: z.string().trim().min(2, "词库名至少 2 个字符").max(60, "词库名不能超过 60 个字符"),
  description: z
    .string()
    .trim()
    .max(200, "描述不能超过 200 个字符")
    .optional()
    .or(z.literal("")),
});

export const addWordSchema = z.object({
  wordListId: z.string().trim().min(1, "请选择词库"),
  word: z
    .string()
    .trim()
    .min(1, "请输入英文单词")
    .max(80, "单词长度不能超过 80")
    .regex(wordPattern, "单词仅支持英文字母、空格、连字符和单引号"),
  acceptedAnswers: z.string().trim().max(200, "可接受拼写不能超过 200 个字符").optional().or(z.literal("")),
  meaning: z.string().trim().min(1, "请输入中文释义").max(200, "释义不能超过 200 个字符"),
  phonetic: z.string().trim().max(80, "音标不能超过 80 个字符").optional().or(z.literal("")),
  partOfSpeech: z.string().trim().max(20, "词性不能超过 20 个字符").optional().or(z.literal("")),
});

export const importWordsSchema = z.object({
  targetWordListId: z.string().trim().optional(),
  newListName: z.string().trim().max(60, "新词库名不能超过 60 个字符").optional(),
  rawInput: z.string().trim().optional(),
});

export const submitAnswerSchema = z.object({
  wordListId: z.string().trim().min(1),
  wordId: z.string().trim().min(1),
  testMode: z.enum(["audio_to_word", "meaning_to_word", "spot_check"]),
  userAnswer: z.string().trim().min(1, "请输入你的拼写"),
});

export const submitSpotCheckResultsSchema = z.object({
  wordListId: z.string().trim().min(1),
  timeLimitSeconds: z.number().int().nullable(),
  elapsedSeconds: z.number().int().min(0),
  results: z
    .array(
      z.object({
        wordId: z.string().trim().min(1),
        userAnswer: z.string().trim(),
      }),
    )
    .min(1, "至少需要提交 1 条作答记录"),
});

export type ParsedWord = {
  word: string;
  meanings: string[];
  acceptedAnswers?: string[];
  phonetic?: string | null;
  partOfSpeech?: string | null;
};

const partOfSpeechPattern =
  /^(n|v|vt|vi|adj|adv|prep|conj|pron|modal v|modal|abbr|num|art|int|aux|phr)\.?$/i;

function parseExtendedWordSegment(segment: string) {
  const parts = segment.split("|").map((item) => item.trim());

  if (parts.length === 1) {
    return { wordPart: parts[0], acceptedAnswers: [], phonetic: null, partOfSpeech: null };
  }

  return {
    wordPart: parts[0] ?? "",
    acceptedAnswers: parts[1] ? normalizeAcceptedAnswers(parts[1]) : [],
    phonetic: parts[2] || null,
    partOfSpeech: parts[3] || null,
  };
}

export function parseWordsFromText(source: string) {
  const normalizedSource = source.replaceAll("：", ":").replace(/\r\n/g, "\n").trim();

  const rawSegments = normalizedSource
    .split(/[;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!rawSegments.length) {
    throw new Error("未解析到有效单词，格式应为 英文:中文;英文:中文");
  }

  const invalidSegments: string[] = [];
  const parsed: ParsedWord[] = [];
  let currentWord: ParsedWord | null = null;

  for (const [index, segment] of rawSegments.entries()) {
    const [leftPart, ...meaningParts] = segment.split(":");
    const normalizedLeftPart = leftPart?.trim() ?? "";
    const meaning = meaningParts.join(":").trim();
    const isContinuation =
      currentWord &&
      !normalizedLeftPart.includes("|") &&
      Boolean(meaningParts.length) &&
      partOfSpeechPattern.test(normalizedLeftPart.replace(/\s+/g, " ").trim());

    if (isContinuation && currentWord) {
      const extraMeanings = normalizeMeanings(meaning);

      if (!extraMeanings.length) {
        invalidSegments.push(`第 ${index + 1} 项：${segment}`);
        continue;
      }

      currentWord.meanings = normalizeMeanings([...currentWord.meanings, ...extraMeanings]);
      currentWord.partOfSpeech = currentWord.partOfSpeech
        ? `${currentWord.partOfSpeech}; ${normalizedLeftPart}`
        : normalizedLeftPart;
      continue;
    }

    const { wordPart, acceptedAnswers, phonetic, partOfSpeech } = parseExtendedWordSegment(normalizedLeftPart);
    const normalizedWord = wordPart.trim().toLowerCase();
    const normalizedMeanings = normalizeMeanings(meaning);

    if (
      !normalizedLeftPart ||
      !meaningParts.length ||
      !normalizedWord ||
      !normalizedMeanings.length ||
      !importWordPattern.test(normalizedWord)
    ) {
      invalidSegments.push(`第 ${index + 1} 项：${segment}`);
      currentWord = null;
      continue;
    }

    currentWord = {
      word: normalizedWord,
      meanings: normalizedMeanings,
      acceptedAnswers,
      phonetic,
      partOfSpeech,
    };
    parsed.push(currentWord);
  }

  if (invalidSegments.length) {
    throw new Error(
      `以下内容格式不合法，请使用 英文:中文;英文:中文 格式：${invalidSegments.join(" / ")}`,
    );
  }

  return parsed.filter((item) => Boolean(item.word && item.meanings.length));
}
