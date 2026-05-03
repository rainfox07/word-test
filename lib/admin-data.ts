import { promises as fs } from "node:fs";
import path from "node:path";

import { and, desc, eq, gte, isNotNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { countAll, testRecords, users, wordLists, words } from "@/db/schema";
import { env } from "@/lib/env";
import { getDisplayMeaning } from "@/lib/word-entry";

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function sevenDaysAgo() {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString();
}

function twentyFourHoursAgo() {
  const date = new Date();
  date.setHours(date.getHours() - 24);
  return date.toISOString();
}

function percentage(correct: number, total: number) {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

async function getPackageVersion() {
  try {
    const packageJsonPath = path.resolve(process.cwd(), "package.json");
    const raw = await fs.readFile(packageJsonPath, "utf8");
    const parsed = JSON.parse(raw) as { version?: string };
    return parsed.version ?? "unknown";
  } catch {
    return "unknown";
  }
}

async function getDatabaseHealth() {
  try {
    await db.select({ value: sql<number>`1` }).from(users).limit(1);
    return { label: "正常", tone: "emerald" as const };
  } catch {
    return { label: "异常", tone: "rose" as const };
  }
}

async function getAudioApiHealth() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const response = await fetch(`${env.dictionaryApiBaseUrl}/test`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timer);

    return response.ok
      ? { label: "正常", tone: "emerald" as const }
      : { label: "异常", tone: "rose" as const };
  } catch {
    return { label: "异常", tone: "rose" as const };
  }
}

export async function getAdminDashboardData(sortBy: "practice" | "accuracy" = "practice") {
  const today = startOfToday();
  const recentWeek = sevenDaysAgo();

  const [
    userCountRows,
    totalPracticeRows,
    todayPracticeRows,
    todayActiveRows,
    allRecordRows,
    allUsers,
    userAggregateRows,
    userWordListRows,
    topWrongRows,
    recentWrongRows,
    wordListsData,
    wordListAggregateRows,
    completionRows,
    activityUsers,
    activityWordLists,
    activityRecords,
    createdWordListUsersRows,
    startedTestUsersRows,
    recent24hWrongRows,
    packageVersion,
    databaseHealth,
    audioApiHealth,
  ] = await Promise.all([
    db.select({ value: countAll }).from(users),
    db.select({ value: countAll }).from(testRecords),
    db
      .select({ value: countAll })
      .from(testRecords)
      .where(gte(testRecords.answeredAt, today)),
    db
      .select({ value: sql<number>`count(distinct ${testRecords.userId})` })
      .from(testRecords)
      .where(gte(testRecords.answeredAt, today)),
    db
      .select({
        isCorrect: testRecords.isCorrect,
      })
      .from(testRecords),
    db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
    }),
    db
      .select({
        userId: testRecords.userId,
        totalPractice: countAll,
        totalCorrect: sql<number>`sum(case when ${testRecords.isCorrect} = 1 then 1 else 0 end)`,
        wrongCount: sql<number>`sum(case when ${testRecords.isCorrect} = 0 then 1 else 0 end)`,
        lastActiveAt: sql<string>`max(${testRecords.answeredAt})`,
      })
      .from(testRecords)
      .groupBy(testRecords.userId),
    db
      .select({
        userId: wordLists.ownerId,
        createdWordLists: countAll,
      })
      .from(wordLists)
      .where(isNotNull(wordLists.ownerId))
      .groupBy(wordLists.ownerId),
    db
      .select({
        wordId: words.id,
        word: words.word,
        meaning: words.meaning,
        meaningsJson: words.meaningsJson,
        wordListName: wordLists.name,
        wrongCount: sql<number>`sum(case when ${testRecords.isCorrect} = 0 then 1 else 0 end)`,
        correctCount: sql<number>`sum(case when ${testRecords.isCorrect} = 1 then 1 else 0 end)`,
      })
      .from(testRecords)
      .innerJoin(words, eq(words.id, testRecords.wordId))
      .innerJoin(wordLists, eq(wordLists.id, testRecords.wordListId))
      .groupBy(words.id, words.word, words.meaning, words.meaningsJson, wordLists.name),
    db
      .select({
        wordId: words.id,
        word: words.word,
        meaning: words.meaning,
        meaningsJson: words.meaningsJson,
        wordListName: wordLists.name,
        wrongCount: sql<number>`sum(case when ${testRecords.isCorrect} = 0 then 1 else 0 end)`,
        correctCount: sql<number>`sum(case when ${testRecords.isCorrect} = 1 then 1 else 0 end)`,
      })
      .from(testRecords)
      .innerJoin(words, eq(words.id, testRecords.wordId))
      .innerJoin(wordLists, eq(wordLists.id, testRecords.wordListId))
      .where(gte(testRecords.answeredAt, recentWeek))
      .groupBy(words.id, words.word, words.meaning, words.meaningsJson, wordLists.name),
    db.query.wordLists.findMany({
      with: {
        words: true,
      },
      orderBy: [desc(wordLists.isSystem), desc(wordLists.createdAt)],
    }),
    db
      .select({
        wordListId: testRecords.wordListId,
        totalTests: countAll,
        uniqueUsers: sql<number>`count(distinct ${testRecords.userId})`,
        correctCount: sql<number>`sum(case when ${testRecords.isCorrect} = 1 then 1 else 0 end)`,
        lastUsedAt: sql<string>`max(${testRecords.answeredAt})`,
      })
      .from(testRecords)
      .groupBy(testRecords.wordListId),
    db
      .select({
        wordListId: testRecords.wordListId,
        userId: testRecords.userId,
        completedWords: sql<number>`count(distinct case when ${testRecords.isCorrect} = 1 then ${testRecords.wordId} end)`,
      })
      .from(testRecords)
      .groupBy(testRecords.wordListId, testRecords.userId),
    db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
      limit: 8,
    }),
    db.query.wordLists.findMany({
      orderBy: [desc(wordLists.createdAt)],
      limit: 8,
      with: {
        owner: true,
      },
    }),
    db
      .select({
        id: testRecords.id,
        answeredAt: testRecords.answeredAt,
        userName: users.name,
        wordListName: wordLists.name,
        word: words.word,
        isCorrect: testRecords.isCorrect,
      })
      .from(testRecords)
      .innerJoin(users, eq(users.id, testRecords.userId))
      .innerJoin(words, eq(words.id, testRecords.wordId))
      .innerJoin(wordLists, eq(wordLists.id, testRecords.wordListId))
      .orderBy(desc(testRecords.answeredAt))
      .limit(12),
    db
      .select({ value: sql<number>`count(distinct ${wordLists.ownerId})` })
      .from(wordLists)
      .where(isNotNull(wordLists.ownerId)),
    db.select({ value: sql<number>`count(distinct ${testRecords.userId})` }).from(testRecords),
    db
      .select({ value: countAll })
      .from(testRecords)
      .where(and(eq(testRecords.isCorrect, false), gte(testRecords.answeredAt, twentyFourHoursAgo()))),
    getPackageVersion(),
    getDatabaseHealth(),
    getAudioApiHealth(),
  ]);

  const totalUsers = userCountRows[0]?.value ?? 0;
  const totalPracticeCount = totalPracticeRows[0]?.value ?? 0;
  const todayPracticeCount = todayPracticeRows[0]?.value ?? 0;
  const todayActiveUsers = todayActiveRows[0]?.value ?? 0;
  const totalWrongCount = allRecordRows.filter((row) => !row.isCorrect).length;
  const totalCorrectCount = allRecordRows.filter((row) => row.isCorrect).length;
  const averageAccuracy = percentage(totalCorrectCount, allRecordRows.length);

  const userAggregateMap = new Map(userAggregateRows.map((row) => [row.userId, row]));
  const userWordListMap = new Map(userWordListRows.map((row) => [row.userId, row.createdWordLists]));
  const completedPracticeUsersApprox = userAggregateRows.filter((row) => row.totalPractice >= 10).length;

  const userPerformance = allUsers
    .map((user) => {
      const aggregate = userAggregateMap.get(user.id);
      const totalPractice = aggregate?.totalPractice ?? 0;
      const totalCorrect = aggregate?.totalCorrect ?? 0;
      const wrongCount = aggregate?.wrongCount ?? 0;

      return {
        id: user.id,
        name: user.name,
        email: user.phone ?? user.email,
        registeredAt: user.createdAt,
        totalPractice,
        accuracy: percentage(totalCorrect, totalPractice),
        wrongCount,
        lastActiveAt: aggregate?.lastActiveAt ?? null,
        createdWordLists: userWordListMap.get(user.id) ?? 0,
      };
    })
    .sort((left, right) => {
      if (sortBy === "accuracy") {
        return right.accuracy - left.accuracy || right.totalPractice - left.totalPractice;
      }

      return right.totalPractice - left.totalPractice || right.accuracy - left.accuracy;
    });

  const topWrongWords = topWrongRows
    .filter((row) => row.wrongCount > 0)
    .map((row) => {
      const totalAttempts = row.wrongCount + row.correctCount;
      return {
        wordId: row.wordId,
        word: row.word,
        meaning: getDisplayMeaning(row),
        wordListName: row.wordListName,
        wrongCount: row.wrongCount,
        correctCount: row.correctCount,
        errorRate: percentage(row.wrongCount, totalAttempts),
      };
    })
    .sort((left, right) => right.wrongCount - left.wrongCount || right.errorRate - left.errorRate)
    .slice(0, 10);

  const topWrongWords7d = recentWrongRows
    .filter((row) => row.wrongCount > 0)
    .map((row) => {
      const totalAttempts = row.wrongCount + row.correctCount;
      return {
        wordId: row.wordId,
        word: row.word,
        meaning: getDisplayMeaning(row),
        wordListName: row.wordListName,
        wrongCount: row.wrongCount,
        correctCount: row.correctCount,
        errorRate: percentage(row.wrongCount, totalAttempts),
      };
    })
    .sort((left, right) => right.wrongCount - left.wrongCount || right.errorRate - left.errorRate)
    .slice(0, 10);

  const wrongWordsByListMap = new Map<string, Array<(typeof topWrongWords)[number]>>();
  for (const row of topWrongRows.filter((item) => item.wrongCount > 0)) {
    const list = wrongWordsByListMap.get(row.wordListName) ?? [];
    list.push({
      wordId: row.wordId,
      word: row.word,
      meaning: getDisplayMeaning(row),
      wordListName: row.wordListName,
      wrongCount: row.wrongCount,
      correctCount: row.correctCount,
      errorRate: percentage(row.wrongCount, row.wrongCount + row.correctCount),
    });
    wrongWordsByListMap.set(row.wordListName, list);
  }

  const errorTopByWordList = [...wrongWordsByListMap.entries()]
    .map(([wordListName, rows]) => ({
      wordListName,
      topWords: rows.sort((left, right) => right.wrongCount - left.wrongCount).slice(0, 3),
    }))
    .sort((left, right) => {
      const leftWrong = left.topWords[0]?.wrongCount ?? 0;
      const rightWrong = right.topWords[0]?.wrongCount ?? 0;
      return rightWrong - leftWrong;
    });

  const wordListAggregateMap = new Map(wordListAggregateRows.map((row) => [row.wordListId, row]));
  const completionByListUser = new Map<string, Array<number>>();

  for (const row of completionRows) {
    const list = wordListsData.find((wordList) => wordList.id === row.wordListId);
    const totalWords = list?.words.length ?? 0;
    const rate = totalWords ? Math.round((row.completedWords / totalWords) * 100) : 0;
    const existing = completionByListUser.get(row.wordListId) ?? [];
    existing.push(rate);
    completionByListUser.set(row.wordListId, existing);
  }

  const wordListPerformance = wordListsData.map((list) => {
    const aggregate = wordListAggregateMap.get(list.id);
    const completionRates = completionByListUser.get(list.id) ?? [];
    const averageCompletion = completionRates.length
      ? Math.round(completionRates.reduce((sum, item) => sum + item, 0) / completionRates.length)
      : 0;
    const wordListErrorTop = errorTopByWordList.find((item) => item.wordListName === list.name)?.topWords[0] ?? null;

    return {
      id: list.id,
      name: list.name,
      type: list.isSystem ? "默认词库" : "用户词库",
      wordCount: list.words.length,
      uniqueUsers: aggregate?.uniqueUsers ?? 0,
      totalTests: aggregate?.totalTests ?? 0,
      averageAccuracy: percentage(aggregate?.correctCount ?? 0, aggregate?.totalTests ?? 0),
      averageCompletion,
      hardestWord: wordListErrorTop ? `${wordListErrorTop.word}（${wordListErrorTop.wrongCount} 次错误）` : "暂无数据",
      lastUsedAt: aggregate?.lastUsedAt ?? null,
    };
  });

  const activities = [
    ...activityUsers.map((user) => ({
      id: `user-${user.id}`,
      time: user.createdAt,
      user: user.name,
      action: "新用户注册",
      detail: user.phone ?? user.email,
    })),
    ...activityWordLists.map((list) => ({
      id: `word-list-${list.id}`,
      time: list.createdAt,
      user: list.owner?.name ?? "系统",
      action: "创建词库",
      detail: list.name,
    })),
    ...activityRecords.map((record) => ({
      id: `record-${record.id}`,
      time: record.answeredAt,
      user: record.userName,
      action: record.isCorrect ? "完成一次答题" : "答题出错",
      detail: `${record.word} · ${record.wordListName}`,
    })),
  ]
    .sort((left, right) => right.time.localeCompare(left.time))
    .slice(0, 15);

  const systemHealth = {
    database: databaseHealth,
    audioApi: audioApiHealth,
    recent24hErrorCount: recent24hWrongRows[0]?.value ?? 0,
    certificateStatus: { label: "未接入", tone: "slate" as const },
    version: packageVersion,
    deploymentTime: { label: "未接入", tone: "slate" as const },
  };

  const funnel = {
    registeredUsers: totalUsers,
    createdWordListUsers: createdWordListUsersRows[0]?.value ?? 0,
    startedTestUsers: startedTestUsersRows[0]?.value ?? 0,
    completedPracticeUsersApprox,
    mistakeReviewUsers: null,
    wordReaderUsers: null,
  };

  return {
    overview: {
      totalUsers,
      todayActiveUsers,
      totalPracticeCount,
      todayPracticeCount,
      averageAccuracy,
      totalWrongCount,
    },
    userPerformance,
    sortBy,
    errorAnalysis: {
      topWrongWords,
      topWrongWords7d,
      errorTopByWordList,
    },
    wordListPerformance,
    funnel,
    activities,
    systemHealth,
  };
}

export type AdminDashboardData = Awaited<ReturnType<typeof getAdminDashboardData>>;
