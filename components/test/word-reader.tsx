"use client";

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentWord = words[currentIndex] ?? null;

  const statusText = useMemo(
    () => (currentWord ? `${currentIndex + 1} / ${words.length}` : "0 / 0"),
    [currentIndex, currentWord, words.length],
  );

  const playCurrentWord = async () => {
    if (!currentWord?.pronunciationAudioUrl) {
      setNotice("当前单词暂无音频。");
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(currentWord.pronunciationAudioUrl);
    } else if (audioRef.current.src !== currentWord.pronunciationAudioUrl) {
      audioRef.current.pause();
      audioRef.current = new Audio(currentWord.pronunciationAudioUrl);
    }

    setNotice(null);

    for (let index = 0; index < repeatCount; index += 1) {
      audioRef.current.currentTime = 0;

      try {
        await audioRef.current.play();
      } catch {
        setNotice("音频播放失败，请稍后重试。");
        return;
      }

      await new Promise<void>((resolve) => {
        if (!audioRef.current) {
          resolve();
          return;
        }

        audioRef.current.onended = () => resolve();
      });
    }

    if (!autoPlayNext) {
      return;
    }

    timerRef.current = setTimeout(() => {
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
    }, intervalMs);
  };

  useEffect(() => {
    if (!currentWord) {
      return;
    }

    void playCurrentWord();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex, autoPlayNext, intervalMs, repeatCount, endStrategy]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      audioRef.current?.pause();
    };
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-medium text-brand-700">单词领读</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{wordListName}</h1>
        <p className="mt-2 text-sm text-slate-500">按词库顺序展示单词与释义，并自动播放读音。</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-brand-700">当前进度</p>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{statusText}</span>
          </div>
          {currentWord ? (
            <div className="mt-6 space-y-4">
              <h2 className="text-4xl font-black tracking-tight text-slate-950">{currentWord.word}</h2>
              <p className="text-lg leading-8 text-slate-600">{currentWord.meaning}</p>
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-500">当前词库没有单词。</p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              onClick={() => {
                void playCurrentWord();
              }}
              disabled={!currentWord}
            >
              重新播放
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (currentIndex < words.length - 1) {
                  setCurrentIndex((value) => value + 1);
                }
              }}
              disabled={!currentWord || currentIndex >= words.length - 1}
            >
              下一个单词
            </Button>
          </div>

          {notice ? <p className="mt-4 text-sm text-amber-700">{notice}</p> : null}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-950">播放设置</h2>
          <div className="mt-5 space-y-4">
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-700">自动播放下一个</span>
              <input
                type="checkbox"
                checked={autoPlayNext}
                onChange={(event) => setAutoPlayNext(event.target.checked)}
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
                onChange={(event) => setIntervalMs(Number(event.target.value) || 1500)}
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
                onChange={(event) => setRepeatCount(Number(event.target.value) || 1)}
                className="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">播放结束策略</span>
              <select
                value={endStrategy}
                onChange={(event) => setEndStrategy(event.target.value as EndStrategy)}
                className="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              >
                <option value="stop">播放完当前列表后停止</option>
                <option value="repeat_current">播放完当前列表后重复播放当前列表</option>
                <option value="continue_next_list">播放完当前列表后继续播放下一个词库（占位）</option>
              </select>
            </label>
          </div>
        </Card>
      </div>
    </div>
  );
}
