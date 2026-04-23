import "dotenv/config";

import { and, eq } from "drizzle-orm";

import { db } from "../db";
import { wordLists, words } from "../db/schema";
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

async function main() {
  for (const list of defaultWordLists) {
    const listId = await upsertSystemWordList(list.name, list.description);

    for (const item of list.words) {
      const audioUrl = await fetchPronunciationAudioUrl(item.word);

      await db
        .insert(words)
        .values({
          wordListId: listId,
          word: item.word,
          meaning: item.meaning,
          pronunciationAudioUrl: audioUrl,
          createdByUserId: null,
        })
        .onConflictDoNothing();
    }
  }

  console.log("Seed completed.");
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
