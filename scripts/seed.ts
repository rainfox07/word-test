import "dotenv/config";

import { and, eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";

import { db } from "../db";
import { accounts, users, wordLists, words } from "../db/schema";
import { DEFAULT_ACCOUNT_EMAIL } from "../lib/default-account";
import { fetchPronunciationAudioUrl } from "../lib/dictionary";
import { toStoredWordData } from "../lib/word-entry";

const defaultWordLists = [
  {
    name: "list1",
    description: "基础高频词示例词库",
    words: [
      { word: "apple", meanings: ["苹果"], phonetic: "/ˈæpəl/", partOfSpeech: "n." },
      { word: "banana", meanings: ["香蕉"], phonetic: "/bəˈnænə/", partOfSpeech: "n." },
      { word: "country", meanings: ["国家", "乡村"], phonetic: "/ˈkʌntri/", partOfSpeech: "n." },
      { word: "future", meanings: ["未来", "将来"], phonetic: "/ˈfjuːtʃər/", partOfSpeech: "n." },
      { word: "practice", meanings: ["练习", "实践"], phonetic: "/ˈpræktɪs/", partOfSpeech: "n./v." },
    ],
  },
  {
    name: "list2",
    description: "进阶学习词示例词库",
    words: [
      { word: "acquire", meanings: ["获得", "习得"], phonetic: "/əˈkwaɪər/", partOfSpeech: "v." },
      { word: "accurate", meanings: ["准确的"], phonetic: "/ˈækjərət/", partOfSpeech: "adj." },
      { word: "benefit", meanings: ["益处", "好处"], phonetic: "/ˈbenɪfɪt/", partOfSpeech: "n./v." },
      { word: "challenge", meanings: ["挑战"], phonetic: "/ˈtʃælɪndʒ/", partOfSpeech: "n./v." },
      { word: "estimate", meanings: ["估计", "估价"], phonetic: "/ˈestɪmət/", partOfSpeech: "v./n." },
    ],
  },
  {
    name: "Travel Essentials",
    description: "旅行与出行场景常用词",
    words: [
      { word: "travel", meanings: ["旅行"], phonetic: "/ˈtrævəl/", partOfSpeech: "v./n." },
      { word: "airport", meanings: ["机场"], phonetic: "/ˈerpɔːrt/", partOfSpeech: "n." },
      { word: "ticket", meanings: ["票", "车票"], phonetic: "/ˈtɪkɪt/", partOfSpeech: "n." },
      { word: "hotel", meanings: ["酒店"], phonetic: "/hoʊˈtel/", partOfSpeech: "n." },
      { word: "taxi", meanings: ["出租车"], phonetic: "/ˈtæksi/", partOfSpeech: "n." },
    ],
  },
  {
    name: "Campus Starter",
    description: "校园与课堂入门词汇",
    words: [
      { word: "school", meanings: ["学校"], phonetic: "/skuːl/", partOfSpeech: "n." },
      { word: "teacher", meanings: ["老师"], phonetic: "/ˈtiːtʃər/", partOfSpeech: "n." },
      { word: "student", meanings: ["学生"], phonetic: "/ˈstuːdnt/", partOfSpeech: "n." },
      { word: "lesson", meanings: ["课程", "课"], phonetic: "/ˈlesn/", partOfSpeech: "n." },
      { word: "pencil", meanings: ["铅笔"], phonetic: "/ˈpensl/", partOfSpeech: "n." },
      { word: "color", meanings: ["颜色"], acceptedAnswers: ["colour"], phonetic: "/ˈkʌlər/", partOfSpeech: "n." },
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
  meanings: string[];
  acceptedAnswers?: string[];
  phonetic?: string | null;
  partOfSpeech?: string | null;
  pronunciationAudioUrl: string | null;
}) {
  const existingWord = await db.query.words.findFirst({
    where: and(eq(words.wordListId, input.wordListId), eq(words.word, input.word)),
  });
  const storedWordData = toStoredWordData({
    displayWord: input.word,
    meanings: input.meanings,
    acceptedAnswers: input.acceptedAnswers,
    phonetic: input.phonetic,
    partOfSpeech: input.partOfSpeech,
    pronunciationAudioUrl: input.pronunciationAudioUrl,
  });

  if (existingWord) {
    await db
      .update(words)
      .set({
        ...storedWordData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(words.id, existingWord.id));

    return;
  }

  await db.insert(words).values({
    wordListId: input.wordListId,
    ...storedWordData,
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
        meanings: item.meanings,
        acceptedAnswers: item.acceptedAnswers,
        phonetic: item.phonetic ?? null,
        partOfSpeech: item.partOfSpeech ?? null,
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
