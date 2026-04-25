import Link from "next/link";

import { LearningRecordList } from "@/components/dashboard/learning-record-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type DashboardOverviewProps = {
  wordListCount: number;
  wrongWordCount: number;
  todayLearningCount: number;
  recentAccuracy: number;
  recentRecords: Array<{
    id: string;
    word: string;
    meaning: string;
    userAnswer: string;
    isCorrect: boolean;
    answeredAt: string;
    wordListName: string;
  }>;
  wordLists: Array<{
    id: string;
    name: string;
    words: Array<{ id: string }>;
    progress: {
      completedWords: number;
      totalWords: number;
      completionRate: number;
    };
  }>;
  userName: string;
};

function getRecommendation(
  wordLists: DashboardOverviewProps["wordLists"],
  wrongWordCount: number,
) {
  if (wrongWordCount > 0) {
    return {
      label: "优先动作",
      title: "先回顾错词，把容易卡住的单词补上",
      description: `你当前还有 ${wrongWordCount} 个待复习错词，先把这些词重新过一遍更划算。`,
      href: "/mistakes",
      cta: "去错词复习",
    };
  }

  const inProgressList = [...wordLists]
    .filter((list) => list.progress.totalWords > 0 && list.progress.completionRate > 0 && list.progress.completionRate < 100)
    .sort((left, right) => right.progress.completionRate - left.progress.completionRate)[0];

  if (inProgressList) {
    return {
      label: "继续学习",
      title: `继续完成 ${inProgressList.name}`,
      description: `这个词库已经完成 ${inProgressList.progress.completionRate}%，再推进几轮就能收尾。`,
      href: `/test/${inProgressList.id}`,
      cta: "继续测试",
    };
  }

  const freshList = wordLists.find((list) => list.progress.totalWords > 0);

  if (freshList) {
    return {
      label: "开始新一轮",
      title: `从 ${freshList.name} 开始今天的练习`,
      description: "先做一轮测试，系统会自动记录结果和错词，后面复习会更轻松。",
      href: `/test/${freshList.id}`,
      cta: "开始今日测试",
    };
  }

  return {
    label: "下一步",
    title: "先去准备一个词库",
    description: "当前还没有可学习单词，先在词库页创建或导入一些内容。",
    href: "/word-lists",
    cta: "进入词库管理",
  };
}

export function DashboardOverview({
  wordListCount,
  wrongWordCount,
  todayLearningCount,
  recentAccuracy,
  recentRecords,
  wordLists,
  userName,
}: DashboardOverviewProps) {
  const primaryList = wordLists.find((list) => list.progress.totalWords > 0);
  const recommendation = getRecommendation(wordLists, wrongWordCount);

  const overviewCards = [
    {
      label: "可开始学习的词库",
      value: String(wordListCount),
      tone: "text-slate-950",
      detail: "包含默认词库和你的自定义词库",
    },
    {
      label: "待复习错词",
      value: String(wrongWordCount),
      tone: "text-rose-600",
      detail: "错词会优先影响下一步建议",
    },
    {
      label: "今日学习量",
      value: String(todayLearningCount),
      tone: "text-slate-950",
      detail: "按今天产生的答题记录计算",
    },
    {
      label: "近期正确率",
      value: `${recentAccuracy}%`,
      tone: "text-amber-600",
      detail: "基于最近 20 条学习记录估算",
    },
  ];

  return (
    <div className="grid gap-8">
      <Card className="overflow-hidden border-slate-200 bg-slate-950 text-white">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-medium text-sky-200">学习控制台</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">欢迎回来，{userName}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              今天继续完成你的单词练习。从这里继续测试、复习或领读，把下一步动作做得更直接。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="min-w-36">
                <Link href={primaryList ? `/test/${primaryList.id}` : "/word-lists"}>开始今日测试</Link>
              </Button>
              <Button asChild variant="secondary" className="min-w-36 bg-white text-slate-950 hover:bg-slate-100">
                <Link href="/mistakes">去错词复习</Link>
              </Button>
              <Button asChild variant="ghost" className="min-w-36 text-white hover:bg-white/10 hover:text-white">
                <Link href="/word-lists">进入词库管理</Link>
              </Button>
              <Button asChild variant="ghost" className="min-w-36 text-white hover:bg-white/10 hover:text-white">
                <Link href={primaryList ? `/test/${primaryList.id}/word_reader` : "/word-lists"}>单词领读</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-medium text-sky-200">{recommendation.label}</p>
            <h3 className="mt-3 text-2xl font-black tracking-tight text-white">{recommendation.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{recommendation.description}</p>
            <Button asChild className="mt-6 w-full bg-amber-400 text-slate-950 hover:bg-amber-300">
              <Link href={recommendation.href}>{recommendation.cta}</Link>
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => (
          <Card key={card.label}>
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className={`mt-3 text-4xl font-black ${card.tone}`}>{card.value}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{card.detail}</p>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200 bg-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-700">推荐动作</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{recommendation.title}</h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">{recommendation.description}</p>
          </div>
          <Button asChild variant="secondary">
            <Link href={recommendation.href}>{recommendation.cta}</Link>
          </Button>
        </div>
      </Card>

      <LearningRecordList
        records={recentRecords}
        emptyText="还没有学习记录，先去词库页开始一轮测试或领读。"
        showAllHref="/records"
      />
    </div>
  );
}
