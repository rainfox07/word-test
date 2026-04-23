"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { testRecords, words } from "@/db/schema";
import { requireSession } from "@/lib/auth-session";
import { getMistakeWords, getRandomQuestion, getRecentLearningRecords } from "@/lib/data";
import { ensureWordAudioUrl } from "@/lib/dictionary";
import { submitAnswerSchema } from "@/lib/word-import";

export async function getTestQuestionAction(wordListId: string, excludedWordIds: string[]) {
  const session = await requireSession();
  return getRandomQuestion(wordListId, session.user.id, excludedWordIds);
}

export async function submitTestAnswerAction(payload: {
  wordListId: string;
  wordId: string;
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

  const normalizedAnswer = values.userAnswer.trim().toLowerCase();
  const normalizedWord = selectedWord.word.trim().toLowerCase();
  const isCorrect = normalizedAnswer === normalizedWord;
  const audioUrl = await ensureWordAudioUrl({
    wordId: selectedWord.id,
    word: selectedWord.word,
    currentAudioUrl: selectedWord.pronunciationAudioUrl,
  });

  await db.insert(testRecords).values({
    userId: session.user.id,
    wordId: selectedWord.id,
    wordListId: values.wordListId,
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
    meaning: selectedWord.meaning,
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
