"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { wordLists, words } from "@/db/schema";
import { requireSession } from "@/lib/auth-session";
import { fetchPronunciationAudioUrl } from "@/lib/dictionary";
import { addWordSchema, createWordListSchema, importWordsSchema, parseWordsFromText } from "@/lib/word-import";

export type ActionResult = {
  success: boolean;
  message: string;
};

async function assertOwnedWordList(wordListId: string, userId: string) {
  const wordList = await db.query.wordLists.findFirst({
    where: and(eq(wordLists.id, wordListId), eq(wordLists.ownerId, userId)),
  });

  if (!wordList) {
    throw new Error("词库不存在，或你没有权限操作该词库");
  }

  return wordList;
}

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

    await db.insert(wordLists).values({
      ownerId: session.user.id,
      name: values.name,
      description: values.description || null,
      sourceType: "custom",
      isSystem: false,
    });

    revalidatePath("/word-lists");
    revalidatePath("/dashboard");

    return { success: true, message: "词库创建成功" };
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
      meaning: formData.get("meaning"),
    });

    await assertOwnedWordList(values.wordListId, session.user.id);

    const audioUrl = await fetchPronunciationAudioUrl(values.word);

    await db.insert(words).values({
      wordListId: values.wordListId,
      word: values.word.toLowerCase(),
      meaning: values.meaning,
      pronunciationAudioUrl: audioUrl,
      createdByUserId: session.user.id,
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
    const fileText =
      uploadedFile instanceof File && uploadedFile.size > 0 ? await uploadedFile.text() : "";

    const rawSource = values.rawInput?.trim() || fileText.trim();

    if (!rawSource) {
      throw new Error("请提供手动输入内容，或上传 .txt 文件");
    }

    const parsedWords = parseWordsFromText(rawSource);

    let targetWordListId = values.targetWordListId?.trim() || "";

    if (targetWordListId) {
      await assertOwnedWordList(targetWordListId, session.user.id);
    } else {
      if (!values.newListName?.trim()) {
        throw new Error("未选择现有词库时，请填写新词库名");
      }

      const [newWordList] = await db
        .insert(wordLists)
        .values({
          ownerId: session.user.id,
          name: values.newListName.trim(),
          sourceType: "custom",
          isSystem: false,
        })
        .returning({ id: wordLists.id });

      targetWordListId = newWordList.id;
    }

    for (const item of parsedWords) {
      const audioUrl = await fetchPronunciationAudioUrl(item.word);

      await db
        .insert(words)
        .values({
          wordListId: targetWordListId,
          word: item.word.toLowerCase(),
          meaning: item.meaning,
          pronunciationAudioUrl: audioUrl,
          createdByUserId: session.user.id,
        })
        .onConflictDoNothing();
    }

    revalidatePath("/word-lists");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `成功导入 ${parsedWords.length} 个单词`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "导入失败",
    };
  }
}
