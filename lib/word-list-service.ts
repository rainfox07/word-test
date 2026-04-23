import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { wordLists, words } from "@/db/schema";
import { fetchPronunciationAudioUrl } from "@/lib/dictionary";
import { ParsedWord } from "@/lib/word-import";

export async function getOwnedWordListOrThrow(wordListId: string, userId: string) {
  const wordList = await db.query.wordLists.findFirst({
    where: and(eq(wordLists.id, wordListId), eq(wordLists.ownerId, userId)),
  });

  if (!wordList) {
    throw new Error("词库不存在，或你没有权限操作该词库");
  }

  return wordList;
}

export async function createWordListForUser(input: {
  userId: string;
  name: string;
  description?: string | null;
}) {
  const [createdWordList] = await db
    .insert(wordLists)
    .values({
      ownerId: input.userId,
      name: input.name,
      description: input.description || null,
      sourceType: "custom",
      isSystem: false,
    })
    .returning({
      id: wordLists.id,
      name: wordLists.name,
    });

  return createdWordList;
}

export async function addWordToWordListForUser(input: {
  userId: string;
  wordListId: string;
  word: string;
  meaning: string;
}) {
  await getOwnedWordListOrThrow(input.wordListId, input.userId);

  const normalizedWord = input.word.trim().toLowerCase();
  const audioUrl = await fetchPronunciationAudioUrl(normalizedWord);

  await db.insert(words).values({
    wordListId: input.wordListId,
    word: normalizedWord,
    meaning: input.meaning.trim(),
    pronunciationAudioUrl: audioUrl,
    createdByUserId: input.userId,
  });
}

export async function importWordsForUser(input: {
  userId: string;
  targetWordListId?: string;
  newListName?: string;
  parsedWords: ParsedWord[];
}) {
  let targetWordListId = input.targetWordListId?.trim() || "";
  let targetWordListName = "";

  if (targetWordListId) {
    const ownedWordList = await getOwnedWordListOrThrow(targetWordListId, input.userId);
    targetWordListName = ownedWordList.name;
  } else {
    if (!input.newListName?.trim()) {
      throw new Error("未选择现有词库时，请填写新词库名");
    }

    const createdWordList = await createWordListForUser({
      userId: input.userId,
      name: input.newListName.trim(),
    });

    targetWordListId = createdWordList.id;
    targetWordListName = createdWordList.name;
  }

  let importedCount = 0;
  let skippedCount = 0;

  for (const item of input.parsedWords) {
    const audioUrl = await fetchPronunciationAudioUrl(item.word);

    const insertResult = await db
      .insert(words)
      .values({
        wordListId: targetWordListId,
        word: item.word.trim().toLowerCase(),
        meaning: item.meaning.trim(),
        pronunciationAudioUrl: audioUrl,
        createdByUserId: input.userId,
      })
      .onConflictDoNothing()
      .returning({ id: words.id });

    if (insertResult.length) {
      importedCount += 1;
    } else {
      skippedCount += 1;
    }
  }

  return {
    targetWordListId,
    targetWordListName,
    importedCount,
    skippedCount,
  };
}
