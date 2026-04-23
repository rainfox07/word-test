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
  userAnswer: string;
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
  const [audioNotice, setAudioNotice] = useState<string | null>(null);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
        setAudioNotice(null);
        setAutoAdvanceCountdown(null);
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

  const playAudio = async (options?: { source?: "auto" | "manual"; audioUrl?: string | null }) => {
    const audioUrl = options?.audioUrl ?? question?.audioUrl ?? feedback?.audioUrl;
    const isAutoPlayback = options?.source === "auto";

    if (!audioUrl) {
      setAudioNotice("当前单词暂无可播放音频。");
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
    } else if (audioRef.current.src !== audioUrl) {
      audioRef.current.pause();
      audioRef.current = new Audio(audioUrl);
    }

    audioRef.current.currentTime = 0;
    try {
      await audioRef.current.play();
      setAudioNotice(null);
    } catch {
      setAudioNotice(
        isAutoPlayback
          ? "浏览器阻止了自动播放，请点击播放按钮继续练习。"
          : "音频播放失败，请稍后重试。",
      );
    }
  };

  useEffect(() => {
    if (!question) {
      return;
    }

    if (question.hasAudio) {
      void playAudio({ source: "auto", audioUrl: question.audioUrl });
      return;
    }

    setAudioNotice("当前单词暂无音频，你可以直接尝试拼写或切换下一题。");
  }, [question?.wordId]);

  useEffect(() => {
    if (!question || feedback) {
      return;
    }

    // Delay focus until the next frame so the input is enabled and rendered for the new question.
    const frameId = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [question?.wordId, feedback]);

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
        setUsedWordIds((current) =>
          current.includes(question.wordId) ? current : [...current, question.wordId],
        );
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

  useEffect(() => {
    if (!feedback?.isCorrect || !question) {
      setAutoAdvanceCountdown(null);
      return;
    }

    setAutoAdvanceCountdown(1);
    autoAdvanceTimerRef.current = setTimeout(() => {
      const nextExcludedIds = usedWordIds.includes(question.wordId)
        ? usedWordIds
        : [...usedWordIds, question.wordId];

      setUsedWordIds(nextExcludedIds);
      loadQuestion(nextExcludedIds);
    }, 1000);

    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, [feedback?.isCorrect, question?.wordId, usedWordIds]);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
      audioRef.current?.pause();
    };
  }, []);

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
            <Button
              className="mt-4 h-16 w-full text-lg"
              onClick={() => {
                void playAudio({ source: "manual" });
              }}
            >
              {question.hasAudio ? "播放单词音频" : "该单词暂无音频"}
            </Button>
            <p className="mt-3 text-sm text-slate-300">{audioNotice || "播放按钮支持重复点击。"}</p>
          </div>

          <div className="space-y-3">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">请输入英文单词拼写</span>
              <Input
                ref={inputRef}
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    handleSubmit();
                  }
                }}
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
              {feedback.isCorrect ? (
                <p className="mt-2 text-sm">
                  正确拼写：{feedback.correctWord} · 中文含义：{feedback.meaning}
                  {autoAdvanceCountdown !== null ? ` · ${autoAdvanceCountdown} 秒后进入下一题` : ""}
                </p>
              ) : (
                <div className="mt-3 space-y-3 text-sm">
                  <p>你的输入：{feedback.userAnswer}</p>
                  <p>正确拼写：{feedback.correctWord}</p>
                  <p>中文含义：{feedback.meaning}</p>
                  <div>
                    <Button
                      variant="secondary"
                      className="border border-rose-200 bg-white text-rose-700 hover:bg-rose-100"
                      onClick={() => {
                        void playAudio({ source: "manual", audioUrl: feedback.audioUrl });
                      }}
                    >
                      播放该单词音频
                    </Button>
                  </div>
                </div>
              )}
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
