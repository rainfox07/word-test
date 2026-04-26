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
  {
    name: "reading-demo",
    description: "基于阅读课本的单词库，包含了第三单元sectionA的单词",
    words: [
      { word: "grant", meanings: ["认为", "授予"], phonetic: "/ɡrɑːnt/", partOfSpeech: "vt." },
      { word: "conduct", meanings: ["实施", "引导"], phonetic: "/kənˈdʌkt/", partOfSpeech: "vt." },
      { word: "accustomed", meanings: ["习惯的", "适应的"], phonetic: "/əˈkʌstəmd/", partOfSpeech: "adj." },
      { word: "utility", meanings: ["公用事业", "效用"], phonetic: "/juːˈtɪləti/", partOfSpeech: "n." },
      { word: "exaggeration", meanings: ["夸张", "夸大"], phonetic: "/ɪɡˌzædʒəˈreɪʃn/", partOfSpeech: "n." },
      { word: "shrug", meanings: ["耸肩", "漠视"], phonetic: "/ʃrʌɡ/", partOfSpeech: "v." },
      { word: "sector", meanings: ["部门", "领域"], phonetic: "/ˈsektə(r)/", partOfSpeech: "n." },
      { word: "recruit", meanings: ["招聘", "招募"], phonetic: "/rɪˈkruːt/", partOfSpeech: "v." },
      { word: "employee", meanings: ["员工", "雇员"], phonetic: "/ɪmˈplɔɪiː/", partOfSpeech: "n." },
      { word: "entrepreneur", meanings: ["企业家", "创业者"], phonetic: "/ˌɒntrəprəˈnɜː(r)/", partOfSpeech: "n." },
      { word: "entrepreneurship", meanings: ["企业家精神", "创业"], phonetic: "/ˌɒntrəprəˈnɜːʃɪp/", partOfSpeech: "n." },
      { word: "persevere", meanings: ["坚持", "锲而不舍"], phonetic: "/ˌpɜːsɪˈvɪə(r)/", partOfSpeech: "v." },
      { word: "persevering", meanings: ["坚毅的", "刻苦的"], phonetic: "/ˌpɜːsɪˈvɪərɪŋ/", partOfSpeech: "adj." },
      { word: "endure", meanings: ["忍受", "持续"], phonetic: "/ɪnˈdjʊə(r)/", partOfSpeech: "v." },
      { word: "internal", meanings: ["内部的", "内心的"], phonetic: "/ɪnˈtɜːnl/", partOfSpeech: "adj." },
      { word: "innovation", meanings: ["创新", "革新"], phonetic: "/ˌɪnəˈveɪʃn/", partOfSpeech: "n." },
      { word: "assign", meanings: ["分配", "指派"], phonetic: "/əˈsaɪn/", partOfSpeech: "v." },
      { word: "feature", meanings: ["特征", "特色"], phonetic: "/ˈfiːtʃə(r)/", partOfSpeech: "n." },
      { word: "invaluable", meanings: ["无价的", "极珍贵的"], phonetic: "/ɪnˈvæljuəbl/", partOfSpeech: "adj." },
      { word: "furthermore", meanings: ["此外", "而且"], phonetic: "/ˈfɜːðəmɔː(r)/", partOfSpeech: "adv." },
      { word: "conventional", meanings: ["传统的", "常规的"], phonetic: "/kənˈvenʃənl/", partOfSpeech: "adj." },
      { word: "sufficient", meanings: ["足够的", "充分的"], phonetic: "/səˈfɪʃnt/", partOfSpeech: "adj." },
      { word: "shift", meanings: ["轮班", "转移"], phonetic: "/ʃɪft/", partOfSpeech: "n." },
      { word: "schedule", meanings: ["日程", "计划表"], phonetic: "/ˈʃedjuːl/", partOfSpeech: "n." },
      { word: "flexible", meanings: ["灵活的", "柔韧的"], phonetic: "/ˈfleksəbl/", partOfSpeech: "adj." },
      { word: "vigorous", meanings: ["强劲的", "精力充沛的"], phonetic: "/ˈvɪɡərəs/", partOfSpeech: "adj." },
      { word: "ethic", meanings: ["道德", "伦理"], phonetic: "/ˈeθɪk/", partOfSpeech: "n." },
      { word: "parallel", meanings: ["相似的", "平行的"], phonetic: "/ˈpærəlel/", partOfSpeech: "adj." },
      { word: "exhibit", meanings: ["展示", "展览"], phonetic: "/ɪɡˈzɪbɪt/", partOfSpeech: "v." },
      { word: "collective", meanings: ["集体的", "共同的"], phonetic: "/kəˈlektɪv/", partOfSpeech: "adj." },
      { word: "persistence", meanings: ["坚持", "毅力"], phonetic: "/pəˈsɪstəns/", partOfSpeech: "n." },
      { word: "stunning", meanings: ["惊人的", "绝妙的"], phonetic: "/ˈstʌnɪŋ/", partOfSpeech: "adj." },
      { word: "enhance", meanings: ["提升", "增强"], phonetic: "/ɪnˈhɑːns/", partOfSpeech: "v." },
      { word: "strive", meanings: ["奋斗", "努力"], phonetic: "/straɪv/", partOfSpeech: "v." },
      { word: "stir", meanings: ["激发", "搅动"], phonetic: "/stɜː(r)/", partOfSpeech: "v." },
      { word: "functionality", meanings: ["功能", "实用性"], phonetic: "/ˌfʌŋkʃəˈnæləti/", partOfSpeech: "n." },
      { word: "seamlessly", meanings: ["无缝地", "流畅地"], phonetic: "/ˈsiːmləsli/", partOfSpeech: "adv." },
      { word: "weave", meanings: ["编织", "编造"], phonetic: "/wiːv/", partOfSpeech: "v." },
      { word: "fabric", meanings: ["布料", "质地"], phonetic: "/ˈfæbrɪk/", partOfSpeech: "n." },
      { word: "motivate", meanings: ["激励", "促使"], phonetic: "/ˈməʊtɪveɪt/", partOfSpeech: "v." },
      { word: "retain", meanings: ["保留", "留住"], phonetic: "/rɪˈteɪn/", partOfSpeech: "v." },
      { word: "resourceful", meanings: ["足智多谋的", "机敏的"], phonetic: "/rɪˈsɔːsfl/", partOfSpeech: "adj." },
      { word: "perceive", meanings: ["看待", "察觉"], phonetic: "/pəˈsiːv/", partOfSpeech: "v." },
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
