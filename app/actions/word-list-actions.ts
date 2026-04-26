"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { requireSession } from "@/lib/auth-session";
import {
  addWordToWordListForUser,
  createWordListForUser,
  getOwnedWordListOrThrow,
  importWordsForUser,
} from "@/lib/word-list-service";
import { db } from "@/db";
import { wordLists } from "@/db/schema";
import { normalizeMeanings } from "@/lib/word-entry";
import { addWordSchema, createWordListSchema, importWordsSchema, parseWordsFromText } from "@/lib/word-import";

export type ActionResult = {
  success: boolean;
  message: string;
};

export async function createWordListAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await requireSession();
    const values = createWordListSchema.parse({
      name: formData.get("name"),
      description: formData.get("description"),
    });

    const createdWordList = await createWordListForUser({
      userId: session.user.id,
      name: values.name,
      description: values.description || null,
    });

    revalidatePath("/word-lists");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `词库“${createdWordList.name}”创建成功`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "词库创建失败",
    };
  }
}

export async function addWordAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await requireSession();
    const values = addWordSchema.parse({
      wordListId: formData.get("wordListId"),
      word: formData.get("word"),
      acceptedAnswers: formData.get("acceptedAnswers"),
      meaning: formData.get("meaning"),
      phonetic: formData.get("phonetic"),
      partOfSpeech: formData.get("partOfSpeech"),
    });

    await addWordToWordListForUser({
      userId: session.user.id,
      wordListId: values.wordListId,
      word: values.word,
      meanings: normalizeMeanings(values.meaning),
      acceptedAnswers: values.acceptedAnswers ? values.acceptedAnswers.split(/[，,;；/|]+/g) : [],
      phonetic: values.phonetic || null,
      partOfSpeech: values.partOfSpeech || null,
    });

    revalidatePath("/word-lists");
    revalidatePath("/dashboard");

    return { success: true, message: "单词已添加" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "添加单词失败",
    };
  }
}

export async function deleteWordListAction(wordListId: string): Promise<ActionResult> {
  try {
    const session = await requireSession();
    const ownedWordList = await getOwnedWordListOrThrow(wordListId, session.user.id);

    await db.delete(wordLists).where(eq(wordLists.id, ownedWordList.id));

    revalidatePath("/word-lists");
    revalidatePath("/dashboard");
    revalidatePath("/mistakes");

    return {
      success: true,
      message: `词库“${ownedWordList.name}”已删除`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "删除词库失败",
    };
  }
}

export async function importWordsAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await requireSession();
    const values = importWordsSchema.parse({
      targetWordListId: formData.get("targetWordListId"),
      newListName: formData.get("newListName"),
      rawInput: formData.get("rawInput"),
    });

    const uploadedFile = formData.get("txtFile");
    if (uploadedFile instanceof File && uploadedFile.size > 0 && !uploadedFile.name.endsWith(".txt")) {
      throw new Error("仅支持上传 .txt 文件");
    }

    const fileText = uploadedFile instanceof File && uploadedFile.size > 0 ? await uploadedFile.text() : "";

    const rawSource = values.rawInput?.trim() || fileText.trim();

    if (!rawSource) {
      throw new Error("请提供手动输入内容，或上传 .txt 文件");
    }

    const parsedWords = parseWordsFromText(rawSource);
    const result = await importWordsForUser({
      userId: session.user.id,
      targetWordListId: values.targetWordListId,
      newListName: values.newListName,
      parsedWords,
    });

    revalidatePath("/word-lists");
    revalidatePath("/dashboard");

    return {
      success: true,
      message:
        result.skippedCount > 0
          ? `已导入 ${result.importedCount} 个单词，跳过 ${result.skippedCount} 个重复单词，目标词库：${result.targetWordListName}`
          : `成功导入 ${result.importedCount} 个单词，目标词库：${result.targetWordListName}`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "导入失败",
    };
  }
}
