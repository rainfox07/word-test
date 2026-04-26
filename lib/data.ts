import { and, asc, countDistinct, desc, eq, inArray, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { testRecords, wordLists, words } from "@/db/schema";
import { ensureWordAudioUrl } from "@/lib/dictionary";
import { TestMode } from "@/lib/test-modes";
import { getDisplayMeaning, toWordView } from "@/lib/word-entry";

export async function getAccessibleWordLists(userId: string) {
  const lists = await db.query.wordLists.findMany({
    where: or(eq(wordLists.isSystem, true), eq(wordLists.ownerId, userId)),
    with: {
      words: true,
    },
    orderBy: [desc(wordLists.isSystem), desc(wordLists.createdAt)],
  });

  return lists.map((list) => ({
    ...list,
    words: list.words.map((word) => toWordView(word)),
  }));
}

export async function getAccessibleWordListsWithProgress(userId: string) {
  const [wordListsData, completionRows] = await Promise.all([
    getAccessibleWordLists(userId),
    db
      .select({
        wordListId: testRecords.wordListId,
        completedWords: countDistinct(testRecords.wordId),
      })
      .from(testRecords)
      .where(and(eq(testRecords.userId, userId), eq(testRecords.isCorrect, true)))
      .groupBy(testRecords.wordListId),
  ]);

  const completionMap = new Map(
    completionRows.map((row) => [row.wordListId, row.completedWords]),
  );

  return wordListsData.map((list) => {
    const totalWords = list.words.length;
    const completedWords = completionMap.get(list.id) ?? 0;
    const completionRate = totalWords ? Math.round((completedWords / totalWords) * 100) : 0;

    return {
      ...list,
      progress: {
        completedWords,
        totalWords,
        completionRate,
      },
    };
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
        orderBy: [asc(words.createdAt)],
      },
    },
  });
}

export async function getNormalizedWordListForUser(wordListId: string, userId: string) {
  const wordList = await getWordListForUser(wordListId, userId);

  if (!wordList) {
    return null;
  }

  return {
    ...wordList,
    words: wordList.words.map((word) => toWordView(word)),
  };
}

export async function getDashboardStats(userId: string) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [wordListsWithProgress, recentRecords, wrongWordCountResult, todayLearningCountResult, recentAccuracyRows] =
    await Promise.all([
      getAccessibleWordListsWithProgress(userId),
      getRecentLearningRecords(userId, 5),
      db
        .select({ value: countDistinct(testRecords.wordId) })
        .from(testRecords)
        .where(and(eq(testRecords.userId, userId), eq(testRecords.isCorrect, false))),
      db
        .select({ value: sql<number>`count(*)` })
        .from(testRecords)
        .where(and(eq(testRecords.userId, userId), sql`${testRecords.answeredAt} >= ${todayStart.toISOString()}`)),
      db
        .select({ isCorrect: testRecords.isCorrect })
        .from(testRecords)
        .where(eq(testRecords.userId, userId))
        .orderBy(desc(testRecords.answeredAt))
        .limit(20),
    ]);

  const recentAccuracy =
    recentAccuracyRows.length > 0
      ? Math.round(
          (recentAccuracyRows.filter((record) => record.isCorrect).length / recentAccuracyRows.length) * 100,
        )
      : 0;

  return {
    wordListCount: wordListsWithProgress.length,
    wrongWordCount: wrongWordCountResult[0]?.value ?? 0,
    todayLearningCount: todayLearningCountResult[0]?.value ?? 0,
    recentAccuracy,
    recentRecords,
    wordLists: wordListsWithProgress,
  };
}

export async function getRecentLearningRecords(userId: string, limit = 8) {
  return db
    .select({
      id: testRecords.id,
      userAnswer: testRecords.userAnswer,
      isCorrect: testRecords.isCorrect,
      answeredAt: testRecords.answeredAt,
      testMode: testRecords.testMode,
      word: words.word,
      meaning: words.meaning,
      meaningsJson: words.meaningsJson,
      wordListName: wordLists.name,
    })
    .from(testRecords)
    .innerJoin(words, eq(words.id, testRecords.wordId))
    .innerJoin(wordLists, eq(wordLists.id, testRecords.wordListId))
    .where(eq(testRecords.userId, userId))
    .orderBy(desc(testRecords.answeredAt))
    .limit(limit)
    .then((records) =>
      records.map((record) => ({
        ...record,
        meaning: getDisplayMeaning({
          meaning: record.meaning,
          meaningsJson: record.meaningsJson,
        }),
      })),
    );
}

export async function getMistakeWords(userId: string) {
  const wrongRecords = await db
    .select({
      wordId: words.id,
      word: words.word,
      meaning: words.meaning,
      meaningsJson: words.meaningsJson,
      phonetic: words.phonetic,
      partOfSpeech: words.partOfSpeech,
      pronunciationAudioUrl: words.pronunciationAudioUrl,
      lastWrongAt: sql<string>`max(${testRecords.answeredAt})`,
      wordListName: wordLists.name,
    })
    .from(testRecords)
    .innerJoin(words, eq(words.id, testRecords.wordId))
    .innerJoin(wordLists, eq(wordLists.id, testRecords.wordListId))
    .where(and(eq(testRecords.userId, userId), eq(testRecords.isCorrect, false)))
    .groupBy(
      words.id,
      words.word,
      words.meaning,
      words.meaningsJson,
      words.phonetic,
      words.partOfSpeech,
      words.pronunciationAudioUrl,
      wordLists.name,
    )
    .orderBy(desc(sql`max(${testRecords.answeredAt})`));

  return Promise.all(
    wrongRecords.map(async (record) => ({
      ...record,
      meaning: getDisplayMeaning(record),
      pronunciationAudioUrl: await ensureWordAudioUrl({
        wordId: record.wordId,
        word: record.word,
        currentAudioUrl: record.pronunciationAudioUrl,
      }),
    })),
  );
}

export async function clearMistakesForUser(userId: string) {
  await db.delete(testRecords).where(and(eq(testRecords.userId, userId), eq(testRecords.isCorrect, false)));
}

export async function getRandomQuestion(
  wordListId: string,
  userId: string,
  excludedWordIds: string[],
  testMode: TestMode,
) {
  const list = await getNormalizedWordListForUser(wordListId, userId);

  if (!list) {
    return null;
  }

  const availableWords = list.words.filter((word) => !excludedWordIds.includes(word.id));

  if (!availableWords.length) {
    return null;
  }

  const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
  const audioUrl = await ensureWordAudioUrl({
    wordId: randomWord.id,
    word: randomWord.word,
    currentAudioUrl: randomWord.pronunciationAudioUrl,
  });

  return {
    wordId: randomWord.id,
    word: randomWord.displayWord,
    meaning: randomWord.displayMeaning,
    phonetic: randomWord.phonetic,
    partOfSpeech: randomWord.partOfSpeech,
    audioUrl,
    hasAudio: Boolean(audioUrl),
    remainingCount: availableWords.length,
    testMode,
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
