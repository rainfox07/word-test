import "dotenv/config";

import { and, eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";

import { db } from "../db";
import { accounts, users, wordLists, words } from "../db/schema";
import { DEFAULT_ACCOUNT_EMAIL } from "../lib/default-account";
import { fetchPronunciationAudioUrl } from "../lib/dictionary";

const defaultWordLists = [
  {
    name: "list1",
    description: "基础高频词示例词库",
    words: [
      { word: "apple", meaning: "苹果" },
      { word: "banana", meaning: "香蕉" },
      { word: "country", meaning: "国家" },
      { word: "future", meaning: "未来" },
      { word: "practice", meaning: "练习" },
    ],
  },
  {
    name: "list2",
    description: "进阶学习词示例词库",
    words: [
      { word: "acquire", meaning: "获得" },
      { word: "accurate", meaning: "准确的" },
      { word: "benefit", meaning: "益处" },
      { word: "challenge", meaning: "挑战" },
      { word: "estimate", meaning: "估计" },
    ],
  },
  {
    name: "Travel Essentials",
    description: "旅行与出行场景常用词",
    words: [
      { word: "travel", meaning: "旅行" },
      { word: "airport", meaning: "机场" },
      { word: "ticket", meaning: "票" },
      { word: "hotel", meaning: "酒店" },
      { word: "taxi", meaning: "出租车" },
    ],
  },
  {
    name: "Campus Starter",
    description: "校园与课堂入门词汇",
    words: [
      { word: "school", meaning: "学校" },
      { word: "teacher", meaning: "老师" },
      { word: "student", meaning: "学生" },
      { word: "lesson", meaning: "课程" },
      { word: "pencil", meaning: "铅笔" },
    ],
  },
];

async function upsertSystemWordList(name: string, description: string) {
  const existing = await db.query.wordLists.findFirst({
    where: and(eq(wordLists.name, name), eq(wordLists.isSystem, true)),
  });

  if (existing) {
    return existing.id;
  }

  const [inserted] = await db
    .insert(wordLists)
    .values({
      name,
      description,
      sourceType: "system",
      isSystem: true,
      ownerId: null,
    })
    .returning({ id: wordLists.id });

  return inserted.id;
}

async function upsertWord(input: {
  wordListId: string;
  word: string;
  meaning: string;
  pronunciationAudioUrl: string | null;
}) {
  const existingWord = await db.query.words.findFirst({
    where: and(eq(words.wordListId, input.wordListId), eq(words.word, input.word)),
  });

  if (existingWord) {
    await db
      .update(words)
      .set({
        meaning: input.meaning,
        pronunciationAudioUrl: input.pronunciationAudioUrl,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(words.id, existingWord.id));

    return;
  }

  await db.insert(words).values({
    wordListId: input.wordListId,
    word: input.word,
    meaning: input.meaning,
    pronunciationAudioUrl: input.pronunciationAudioUrl,
    createdByUserId: null,
  });
}

async function removeObsoleteSystemWords(wordListId: string, validWords: string[]) {
  const existingWords = await db.query.words.findMany({
    where: eq(words.wordListId, wordListId),
  });

  for (const existingWord of existingWords) {
    if (!validWords.includes(existingWord.word)) {
      await db.delete(words).where(eq(words.id, existingWord.id));
    }
  }
}

async function ensureDefaultAdminAccount() {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, "admin"),
  });
  const timestamp = new Date().toISOString();

  if (!existingUser) {
    await db.insert(users).values({
      id: "admin",
      name: "admin",
      email: DEFAULT_ACCOUNT_EMAIL,
      emailVerified: true,
      image: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  const existingAccount = await db.query.accounts.findFirst({
    where: and(eq(accounts.providerId, "credential"), eq(accounts.accountId, "admin")),
  });

  if (!existingAccount) {
    const passwordHash = await hashPassword("admin");

    await db.insert(accounts).values({
      id: crypto.randomUUID(),
      accountId: "admin",
      providerId: "credential",
      userId: "admin",
      password: passwordHash,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }
}

async function main() {
  await ensureDefaultAdminAccount();

  for (const list of defaultWordLists) {
    const listId = await upsertSystemWordList(list.name, list.description);
    const validWords = list.words.map((item) => item.word);

    await removeObsoleteSystemWords(listId, validWords);

    for (const item of list.words) {
      const audioUrl = await fetchPronunciationAudioUrl(item.word);

      await upsertWord({
        wordListId: listId,
        word: item.word,
        meaning: item.meaning,
        pronunciationAudioUrl: audioUrl,
      });
    }
  }

  console.log("Seed completed.");
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
