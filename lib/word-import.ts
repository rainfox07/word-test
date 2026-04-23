import { z } from "zod";

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
    .regex(/^[A-Za-z-'\s]+$/, "单词仅支持英文字母、空格、连字符和单引号"),
  meaning: z.string().trim().min(1, "请输入中文释义").max(200, "释义不能超过 200 个字符"),
});

export const importWordsSchema = z.object({
  targetWordListId: z.string().trim().optional(),
  newListName: z.string().trim().max(60, "新词库名不能超过 60 个字符").optional(),
  rawInput: z.string().trim().optional(),
});

export const submitAnswerSchema = z.object({
  wordListId: z.string().trim().min(1),
  wordId: z.string().trim().min(1),
  userAnswer: z.string().trim().min(1, "请输入你的拼写"),
});

export type ParsedWord = {
  word: string;
  meaning: string;
};

export function parseWordsFromText(source: string) {
  const segments = source
    .split(/[;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

  const parsed = segments.map((segment) => {
    const [word, ...meaningParts] = segment.split(":");
    const meaning = meaningParts.join(":").trim();

    return {
      word: word?.trim().toLowerCase(),
      meaning,
    };
  });

  const validWords = parsed.filter((item): item is ParsedWord => Boolean(item.word && item.meaning));

  if (!validWords.length) {
    throw new Error("未解析到有效单词，格式应为 英文:中文;英文:中文");
  }

  return validWords;
}
