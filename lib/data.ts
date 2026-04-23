import { and, countDistinct, desc, eq, inArray, isNotNull, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { testRecords, wordLists, words } from "@/db/schema";

export async function getAccessibleWordLists(userId: string) {
  return db.query.wordLists.findMany({
    where: or(eq(wordLists.isSystem, true), eq(wordLists.ownerId, userId)),
    with: {
      words: true,
    },
    orderBy: [desc(wordLists.isSystem), desc(wordLists.createdAt)],
  });
}

export async function getWordListForUser(wordListId: string, userId: string) {
  return db.query.wordLists.findFirst({
    where: and(
      eq(wordLists.id, wordListId),
      or(eq(wordLists.isSystem, true), eq(wordLists.ownerId, userId)),
    ),
    with: {
      words: {
        orderBy: [desc(words.createdAt)],
      },
    },
  });
}

export async function getDashboardStats(userId: string) {
  const [listCountResult, recentRecords, wrongWordCountResult] = await Promise.all([
    db
      .select({ value: sql<number>`count(*)` })
      .from(wordLists)
      .where(or(eq(wordLists.isSystem, true), eq(wordLists.ownerId, userId))),
    getRecentLearningRecords(userId),
    db
      .select({ value: countDistinct(testRecords.wordId) })
      .from(testRecords)
      .where(and(eq(testRecords.userId, userId), eq(testRecords.isCorrect, false))),
  ]);

  return {
    wordListCount: listCountResult[0]?.value ?? 0,
    wrongWordCount: wrongWordCountResult[0]?.value ?? 0,
    recentRecords,
  };
}

export async function getRecentLearningRecords(userId: string, limit = 8) {
  return db
    .select({
      id: testRecords.id,
      userAnswer: testRecords.userAnswer,
      isCorrect: testRecords.isCorrect,
      answeredAt: testRecords.answeredAt,
      word: words.word,
      meaning: words.meaning,
      wordListName: wordLists.name,
    })
    .from(testRecords)
    .innerJoin(words, eq(words.id, testRecords.wordId))
    .innerJoin(wordLists, eq(wordLists.id, testRecords.wordListId))
    .where(eq(testRecords.userId, userId))
    .orderBy(desc(testRecords.answeredAt))
    .limit(limit);
}

export async function getMistakeWords(userId: string) {
  const wrongRecords = await db
    .select({
      wordId: words.id,
      word: words.word,
      meaning: words.meaning,
      pronunciationAudioUrl: words.pronunciationAudioUrl,
      lastWrongAt: sql<string>`max(${testRecords.answeredAt})`,
      wordListName: wordLists.name,
    })
    .from(testRecords)
    .innerJoin(words, eq(words.id, testRecords.wordId))
    .innerJoin(wordLists, eq(wordLists.id, testRecords.wordListId))
    .where(and(eq(testRecords.userId, userId), eq(testRecords.isCorrect, false)))
    .groupBy(words.id, words.word, words.meaning, words.pronunciationAudioUrl, wordLists.name)
    .orderBy(desc(sql`max(${testRecords.answeredAt})`));

  return wrongRecords;
}

export async function getRandomQuestion(wordListId: string, userId: string, excludedWordIds: string[]) {
  const list = await getWordListForUser(wordListId, userId);

  if (!list) {
    return null;
  }

  const availableWords = list.words.filter((word) => !excludedWordIds.includes(word.id));

  if (!availableWords.length) {
    return null;
  }

  const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];

  return {
    wordId: randomWord.id,
    audioUrl: randomWord.pronunciationAudioUrl,
    hasAudio: Boolean(randomWord.pronunciationAudioUrl),
    remainingCount: availableWords.length,
  };
}

export async function getWordsByIds(wordIds: string[]) {
  if (!wordIds.length) {
    return [];
  }

  return db.query.words.findMany({
    where: inArray(words.id, wordIds),
  });
}
