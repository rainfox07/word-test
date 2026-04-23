"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import { getTestQuestionAction, submitTestAnswerAction } from "@/app/actions/test-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type TestRunnerProps = {
  wordListId: string;
  wordListName: string;
};

type Question = {
  wordId: string;
  audioUrl: string | null;
  hasAudio: boolean;
};

type AnswerFeedback = {
  isCorrect: boolean;
  correctWord: string;
  meaning: string;
  audioUrl: string | null;
};

export function TestRunner({ wordListId, wordListName }: TestRunnerProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [usedWordIds, setUsedWordIds] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loadError, setLoadError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadQuestion = (excludedIds: string[]) => {
    startTransition(async () => {
      try {
        const nextQuestion = await getTestQuestionAction(wordListId, excludedIds);
        setHasFetched(true);

        if (!nextQuestion) {
          setQuestion(null);
          return;
        }

        setQuestion(nextQuestion);
        setAnswer("");
        setFeedback(null);
        setLoadError(null);
        audioRef.current?.pause();
        audioRef.current = null;
      } catch (error) {
        setHasFetched(true);
        setLoadError(error instanceof Error ? error.message : "加载题目失败");
      }
    });
  };

  useEffect(() => {
    loadQuestion([]);
  }, []);

  const playAudio = () => {
    if (!question?.audioUrl) {
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(question.audioUrl);
    }

    audioRef.current.currentTime = 0;
    void audioRef.current.play().catch(() => {
      setLoadError("当前浏览器拦截了自动播放，请再次点击播放按钮。");
    });
  };

  const handleSubmit = () => {
    if (!question || !answer.trim()) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await submitTestAnswerAction({
          wordListId,
          wordId: question.wordId,
          userAnswer: answer,
        });

        setFeedback(result);
        setUsedWordIds((current) => [...current, question.wordId]);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "提交失败");
      }
    });
  };

  const handleNext = () => {
    const nextExcludedIds = question ? [...usedWordIds, question.wordId] : usedWordIds;
    setUsedWordIds(nextExcludedIds);
    loadQuestion(nextExcludedIds);
  };

  return (
    <Card className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="text-sm font-medium text-brand-700">当前词库</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{wordListName}</h1>
        <p className="mt-2 text-sm text-slate-500">播放音频后输入英文拼写。题目会随机抽取且不重复，直到本轮词库耗尽。</p>
      </div>

      {!hasFetched ? (
        <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500">
          正在加载测试题...
        </div>
      ) : question ? (
        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-950 p-6 text-white">
            <p className="text-sm text-sky-200">音频练习区</p>
            <Button className="mt-4 h-16 w-full text-lg" onClick={playAudio}>
              {question.hasAudio ? "播放单词音频" : "该单词暂无音频"}
            </Button>
            <p className="mt-3 text-sm text-slate-300">
              {question.hasAudio
                ? "播放按钮支持重复点击。"
                : "当前单词没有可用音频，你仍可尝试回忆拼写或切换下一题。"}
            </p>
          </div>

          <div className="space-y-3">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">请输入英文单词拼写</span>
              <Input
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="输入你听到的单词"
                className="h-14 text-base"
                disabled={Boolean(feedback)}
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSubmit} disabled={isPending || !answer.trim() || Boolean(feedback)}>
                {isPending ? "提交中..." : "提交答案"}
              </Button>
              <Button variant="secondary" onClick={handleNext} disabled={isPending}>
                下一题
              </Button>
            </div>
          </div>

          {feedback ? (
            <div
              className={`rounded-3xl px-5 py-5 ${
                feedback.isCorrect ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
              }`}
            >
              <p className="text-lg font-semibold">{feedback.isCorrect ? "回答正确" : "回答错误"}</p>
              <p className="mt-2 text-sm">
                正确拼写：{feedback.correctWord} · 中文含义：{feedback.meaning}
              </p>
            </div>
          ) : null}

          {loadError ? (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{loadError}</div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-12 text-center">
          <p className="text-lg font-semibold text-slate-900">当前词库本轮测试已完成</p>
          <p className="mt-2 text-sm text-slate-500">可以回到词库页继续选择其他词库，或重新开始本词库。</p>
          <div className="mt-5 flex justify-center gap-3">
            <Button
              onClick={() => {
                setUsedWordIds([]);
                loadQuestion([]);
              }}
            >
              重新开始
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/word-lists">返回词库页</Link>
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
