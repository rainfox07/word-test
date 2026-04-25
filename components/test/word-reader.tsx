"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ReaderWord = {
  id: string;
  word: string;
  meaning: string;
  pronunciationAudioUrl: string | null;
};

type EndStrategy = "stop" | "repeat_current" | "continue_next_list";

function ReaderSettingsModal({
  autoPlayNext,
  intervalMs,
  repeatCount,
  endStrategy,
  onAutoPlayNextChange,
  onIntervalChange,
  onRepeatCountChange,
  onEndStrategyChange,
  onConfirm,
}: {
  autoPlayNext: boolean;
  intervalMs: number;
  repeatCount: number;
  endStrategy: EndStrategy;
  onAutoPlayNextChange: (value: boolean) => void;
  onIntervalChange: (value: number) => void;
  onRepeatCountChange: (value: number) => void;
  onEndStrategyChange: (value: EndStrategy) => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/55 px-4">
      <div className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card">
        <p className="text-sm font-medium text-brand-700">播放设置</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">先设置领读参数，再开始播放</h2>

        <div className="mt-6 space-y-4">
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-700">自动播放下一个</span>
            <input
              type="checkbox"
              checked={autoPlayNext}
              onChange={(event) => onAutoPlayNextChange(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">两个单词之间的间隔（毫秒）</span>
            <input
              type="number"
              min={500}
              step={500}
              value={intervalMs}
              onChange={(event) => onIntervalChange(Number(event.target.value) || 1500)}
              className="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">每个单词连续朗读次数</span>
            <input
              type="number"
              min={1}
              max={5}
              value={repeatCount}
              onChange={(event) => onRepeatCountChange(Number(event.target.value) || 1)}
              className="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">播放结束策略</span>
            <select
              value={endStrategy}
              onChange={(event) => onEndStrategyChange(event.target.value as EndStrategy)}
              className="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            >
              <option value="stop">播放完当前列表后停止</option>
              <option value="repeat_current">播放完当前列表后重复播放当前列表</option>
              <option value="continue_next_list">播放完当前列表后继续播放下一个词库（占位）</option>
            </select>
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onConfirm}>开始领读</Button>
        </div>
      </div>
    </div>
  );
}

export function WordReader({
  wordListName,
  words,
}: {
  wordListName: string;
  words: ReaderWord[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [intervalMs, setIntervalMs] = useState(1500);
  const [repeatCount, setRepeatCount] = useState(2);
  const [endStrategy, setEndStrategy] = useState<EndStrategy>("stop");
  const [notice, setNotice] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [playNonce, setPlayNonce] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sequenceRef = useRef(0);
  const currentWord = words[currentIndex] ?? null;

  const statusText = useMemo(
    () => (currentWord ? `${currentIndex + 1} / ${words.length}` : "0 / 0"),
    [currentIndex, currentWord, words.length],
  );

  const cancelScheduledPlayback = () => {
    sequenceRef.current += 1;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onpause = null;
      audioRef.current.pause();
    }

    setIsPlaying(false);
  };

  const playSingleRound = async (audio: HTMLAudioElement, sequenceId: number) => {
    audio.currentTime = 0;

    try {
      await audio.play();
    } catch {
      setNotice("音频播放失败，请稍后重试。");
      setIsPlaying(false);
      return false;
    }

    await new Promise<void>((resolve) => {
      const finish = () => {
        audio.onended = null;
        audio.onpause = null;
        resolve();
      };

      audio.onended = finish;
      audio.onpause = finish;
    });

    return sequenceRef.current === sequenceId;
  };

  useEffect(() => {
    if (!hasStarted || isPaused || !currentWord) {
      return;
    }

    const sequenceId = ++sequenceRef.current;

    const run = async () => {
      if (!currentWord.pronunciationAudioUrl) {
        setNotice("当前单词暂无音频。");
        setIsPlaying(false);
        return;
      }

      if (!audioRef.current) {
        audioRef.current = new Audio(currentWord.pronunciationAudioUrl);
      } else if (audioRef.current.src !== currentWord.pronunciationAudioUrl) {
        audioRef.current.pause();
        audioRef.current = new Audio(currentWord.pronunciationAudioUrl);
      }

      setNotice(null);
      setIsPlaying(true);

      for (let index = 0; index < repeatCount; index += 1) {
        const shouldContinue = await playSingleRound(audioRef.current, sequenceId);

        if (!shouldContinue) {
          return;
        }
      }

      if (currentIndex === words.length - 1) {
        setIsCompleted(true);
      }

      if (!autoPlayNext) {
        setIsPlaying(false);
        return;
      }

      timerRef.current = setTimeout(() => {
        if (sequenceRef.current !== sequenceId) {
          return;
        }

        if (currentIndex < words.length - 1) {
          setCurrentIndex((value) => value + 1);
          return;
        }

        if (endStrategy === "repeat_current") {
          setCurrentIndex(0);
          return;
        }

        if (endStrategy === "continue_next_list") {
          setNotice("播放下一个词库当前仅为占位逻辑，暂时停留在当前列表。");
        }

        setIsPlaying(false);
        setIsPaused(true);
      }, intervalMs);
    };

    void run();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex, currentWord?.id, hasStarted, isPaused, autoPlayNext, intervalMs, repeatCount, endStrategy, playNonce, words.length]);

  useEffect(() => {
    return () => {
      cancelScheduledPlayback();
    };
  }, []);

  const startOrResumePlayback = () => {
    if (!currentWord) {
      return;
    }

    setHasStarted(true);
    setIsPaused(false);
    setPlayNonce((value) => value + 1);
  };

  const pausePlayback = () => {
    cancelScheduledPlayback();
    setIsPaused(true);
  };

  return (
    <>
      {showSettings ? (
        <ReaderSettingsModal
          autoPlayNext={autoPlayNext}
          intervalMs={intervalMs}
          repeatCount={repeatCount}
          endStrategy={endStrategy}
          onAutoPlayNextChange={setAutoPlayNext}
          onIntervalChange={setIntervalMs}
          onRepeatCountChange={setRepeatCount}
          onEndStrategyChange={setEndStrategy}
          onConfirm={() => {
            setShowSettings(false);
            startOrResumePlayback();
          }}
        />
      ) : null}

      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-brand-700">单词领读</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{wordListName}</h1>
            <p className="mt-2 text-sm text-slate-500">先设置播放参数，再进入适合投屏和多媒体教学的领读模式。</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                isCompleted ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              }`}
            >
              {isCompleted ? "已完成学习" : "未完成学习"}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
              {statusText}
            </span>
          </div>
        </div>

        <Card className="flex min-h-[28rem] flex-col justify-center bg-white px-8 py-12 text-center">
          {currentWord ? (
            <div className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                  {currentWord.word}
                </h2>
                <p className="mx-auto max-w-3xl text-2xl leading-10 text-slate-600 sm:text-3xl">
                  {currentWord.meaning}
                </p>
              </div>

              {notice ? <p className="text-base font-medium text-amber-700">{notice}</p> : null}
            </div>
          ) : (
            <p className="text-lg text-slate-500">当前词库没有单词。</p>
          )}
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <Card>
            <p className="text-sm font-medium text-brand-700">播放控制</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  if (isPlaying && !isPaused) {
                    pausePlayback();
                    return;
                  }

                  startOrResumePlayback();
                }}
                disabled={!currentWord}
              >
                {isPlaying && !isPaused ? "暂停播放" : hasStarted ? "继续播放" : "开始播放"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  cancelScheduledPlayback();
                  setShowSettings(true);
                }}
              >
                设置
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  cancelScheduledPlayback();
                  setPlayNonce((value) => value + 1);
                  setIsPaused(false);
                  setHasStarted(true);
                }}
                disabled={!currentWord}
              >
                重新播放
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  cancelScheduledPlayback();

                  if (currentIndex < words.length - 1) {
                    setCurrentIndex((value) => value + 1);
                    setIsPaused(false);
                    setHasStarted(true);
                    return;
                  }

                  setIsCompleted(true);
                }}
                disabled={!currentWord || currentIndex >= words.length - 1}
              >
                下一个单词
              </Button>
              <Button asChild variant="ghost">
                <Link href="/">返回主页</Link>
              </Button>
            </div>
          </Card>

          <Card>
            <p className="text-sm font-medium text-brand-700">当前设置</p>
            <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-100 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">自动播放</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{autoPlayNext ? "开启" : "关闭"}</p>
              </div>
              <div className="rounded-2xl bg-slate-100 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">播放间隔</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{intervalMs} ms</p>
              </div>
              <div className="rounded-2xl bg-slate-100 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">重复次数</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{repeatCount} 次</p>
              </div>
              <div className="rounded-2xl bg-slate-100 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">结束策略</p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {endStrategy === "stop"
                    ? "播完停止"
                    : endStrategy === "repeat_current"
                      ? "重复当前列表"
                      : "下一个词库（占位）"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
