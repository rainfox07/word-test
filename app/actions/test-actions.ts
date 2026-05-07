"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { testRecords, words } from "@/db/schema";
import { requireSession } from "@/lib/auth-session";
import {
  clearMistakesForUser,
  getMistakeWords,
  getNormalizedWordListForUser,
  getRandomQuestion,
  getRecentLearningRecords,
} from "@/lib/data";
import { ensureWordAudioUrl } from "@/lib/dictionary";
import { TestMode } from "@/lib/test-modes";
import { getDisplayMeaning, isAcceptedSpelling } from "@/lib/word-entry";
import { submitAnswerSchema, submitSpotCheckResultsSchema } from "@/lib/word-import";

export async function getTestQuestionAction(
  wordListId: string,
  excludedWordIds: string[],
  testMode: TestMode,
) {
  const session = await requireSession();
  return getRandomQuestion(wordListId, session.user.id, excludedWordIds, testMode);
}

export async function clearMistakesAction() {
  const session = await requireSession();
  await clearMistakesForUser(session.user.id);
  revalidatePath("/mistakes");
  revalidatePath("/dashboard");
}

export async function submitTestAnswerAction(payload: {
  wordListId: string;
  wordId: string;
  testMode: TestMode;
  userAnswer: string;
}) {
  const session = await requireSession();
  const values = submitAnswerSchema.parse(payload);

  const selectedWord = await db.query.words.findFirst({
    where: eq(words.id, values.wordId),
    with: {
      wordList: true,
    },
  });

  if (!selectedWord) {
    throw new Error("测试题不存在");
  }

  if (
    selectedWord.wordList.id !== values.wordListId ||
    (!selectedWord.wordList.isSystem && selectedWord.wordList.ownerId !== session.user.id)
  ) {
    throw new Error("你没有权限提交这道题");
  }

  const normalizedAnswer = values.userAnswer.trim().toLowerCase().replace(/\s+/g, " ");
  const isCorrect = isAcceptedSpelling(selectedWord, normalizedAnswer);
  const audioUrl = await ensureWordAudioUrl({
    wordId: selectedWord.id,
    word: selectedWord.word,
    currentAudioUrl: selectedWord.pronunciationAudioUrl,
  });

  await db.insert(testRecords).values({
    userId: session.user.id,
    wordId: selectedWord.id,
    wordListId: values.wordListId,
    testMode: values.testMode,
    userAnswer: normalizedAnswer,
    isCorrect,
  });

  revalidatePath("/dashboard");
  revalidatePath("/mistakes");
  revalidatePath(`/test/${values.wordListId}`);

  return {
    isCorrect,
    userAnswer: normalizedAnswer,
    correctWord: selectedWord.word,
    meaning: getDisplayMeaning(selectedWord),
    audioUrl,
  };
}

export async function getRecentLearningRecordsAction() {
  const session = await requireSession();
  return getRecentLearningRecords(session.user.id);
}

export async function getMistakeWordsAction() {
  const session = await requireSession();
  return getMistakeWords(session.user.id);
}

export async function submitSpotCheckResultsAction(payload: {
  wordListId: string;
  timeLimitSeconds: number | null;
  elapsedSeconds: number;
  results: Array<{
    wordId: string;
    userAnswer: string;
  }>;
}) {
  const session = await requireSession();
  const values = submitSpotCheckResultsSchema.parse(payload);
  const wordList = await getNormalizedWordListForUser(values.wordListId, session.user.id);

  if (!wordList) {
    throw new Error("词库不存在或你没有权限访问");
  }

  const wordMap = new Map(wordList.words.map((word) => [word.id, word]));
  const now = new Date().toISOString();
  const recordsToInsert = values.results.map((result) => {
    const word = wordMap.get(result.wordId);

    if (!word) {
      throw new Error("抽验题目中存在无效单词");
    }

    const normalizedAnswer = result.userAnswer.trim().toLowerCase().replace(/\s+/g, " ");
    const isCorrect = isAcceptedSpelling(word, normalizedAnswer);

    return {
      userId: session.user.id,
      wordId: word.id,
      wordListId: values.wordListId,
      testMode: "spot_check" as const,
      userAnswer: normalizedAnswer,
      isCorrect,
      answeredAt: now,
      correctWord: word.word,
      meaning: getDisplayMeaning(word),
    };
  });

  await db.insert(testRecords).values(
    recordsToInsert.map(({ correctWord: _correctWord, meaning: _meaning, ...record }) => record),
  );

  revalidatePath("/dashboard");
  revalidatePath("/mistakes");
  revalidatePath(`/test/${values.wordListId}`);

  return {
    total: recordsToInsert.length,
    correctCount: recordsToInsert.filter((item) => item.isCorrect).length,
    wrongCount: recordsToInsert.filter((item) => !item.isCorrect).length,
    elapsedSeconds: values.elapsedSeconds,
    timeLimitSeconds: values.timeLimitSeconds,
    mistakes: recordsToInsert
      .filter((item) => !item.isCorrect)
      .map((item) => ({
        wordId: item.wordId,
        userAnswer: item.userAnswer,
        correctWord: item.correctWord,
        meaning: item.meaning,
      })),
  };
}
