"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { submitSpotCheckResultsAction } from "@/app/actions/test-actions";
import { PronunciationSourceSelect } from "@/components/audio/pronunciation-source-select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type PronunciationSource } from "@/lib/audio-source";
import { getStoredPronunciationSource, playWordAudio } from "@/lib/play-word-audio";

type SpotCheckWord = {
  id: string;
  word: string;
  meaning: string;
  acceptedAnswers: string[];
  pronunciationAudioUrl: string | null;
  phonetic?: string | null;
  partOfSpeech?: string | null;
};

type SpotCheckQuestionMode = "meaning" | "audio";

type QuestionResult = {
  wordId: string;
  userAnswer: string;
  isCorrect: boolean;
  correctWord: string;
  meaning: string;
};

type PersistedReport = {
  total: number;
  correctCount: number;
  wrongCount: number;
  elapsedSeconds: number;
  timeLimitSeconds: number | null;
  mistakes: Array<{
    wordId: string;
    userAnswer: string;
    correctWord: string;
    meaning: string;
  }>;
};

function shuffleWords(words: SpotCheckWord[]) {
  const copied = [...words];

  for (let index = copied.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copied[index], copied[randomIndex]] = [copied[randomIndex], copied[index]];
  }

  return copied;
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function SpotCheckRunner({
  wordListId,
  wordListName,
  words,
}: {
  wordListId: string;
  wordListName: string;
  words: SpotCheckWord[];
}) {
  const [wordCount, setWordCount] = useState(Math.min(10, words.length));
  const [timeMode, setTimeMode] = useState<"limited" | "unlimited">(words.length > 15 ? "limited" : "unlimited");
  const [timeMinutes, setTimeMinutes] = useState(10);
  const [questionMode, setQuestionMode] = useState<SpotCheckQuestionMode>("meaning");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [questions, setQuestions] = useState<SpotCheckWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<QuestionResult | null>(null);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [report, setReport] = useState<PersistedReport | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pronunciationSource, setPronunciationSource] = useState<PronunciationSource>("auto");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const hasPersistedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastAutoPlayedWordIdRef = useRef<string | null>(null);

  const timeLimitSeconds = timeMode === "limited" ? timeMinutes * 60 : null;
  const currentWord = questions[currentIndex] ?? null;
  const progressLabel = questions.length ? `${currentIndex + 1} / ${questions.length}` : "0 / 0";
  const finalizedResults =
    finished && feedback && !results.some((item) => item.wordId === feedback.wordId) ? [...results, feedback] : results;

  useEffect(() => {
    setPronunciationSource(getStoredPronunciationSource());
  }, []);

  useEffect(() => {
    if (!started || finished) {
      return;
    }

    const interval = window.setInterval(() => {
      if (!startTimeRef.current) {
        return;
      }

      const elapsed = Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000));
      setElapsedSeconds(elapsed);

      if (timeLimitSeconds !== null) {
        const remaining = Math.max(0, timeLimitSeconds - elapsed);
        setRemainingSeconds(remaining);

        if (remaining <= 0) {
          setFinished(true);
        }
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [started, finished, timeLimitSeconds]);

  useEffect(() => {
    if (!currentWord || feedback) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [currentWord?.id, feedback]);

  useEffect(() => {
    if (finished) {
      audioRef.current?.pause();
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
    }
  }, [finished]);

  const playCurrentWord = async (mode: "manual" | "auto") => {
    if (questionMode !== "audio" || !currentWord) {
      return;
    }

    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    setIsPlaying(true);

    try {
      const playedWith = await playWordAudio({
        word: currentWord.word,
        audioUrl: currentWord.pronunciationAudioUrl,
        audioRef,
        preferredSource: pronunciationSource,
      });

      setAudioNotice(playedWith === "tts" ? "未找到词典音频，将使用系统语音朗读。" : null);
    } catch (error) {
      setAudioNotice(
        mode === "auto"
          ? "读音播放失败，请点击再听一次或切换读音来源。"
          : error instanceof Error
            ? error.message
            : "当前无法播放读音，请稍后重试或切换读音来源。",
      );
    } finally {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (questionMode !== "audio" || !started || !currentWord || finished || feedback) {
      return;
    }

    if (lastAutoPlayedWordIdRef.current === currentWord.id) {
      return;
    }

    lastAutoPlayedWordIdRef.current = currentWord.id;
    void playCurrentWord("auto");
  }, [questionMode, started, currentWord?.id, finished, feedback, pronunciationSource]);

  useEffect(() => {
    if (!finished || hasPersistedRef.current || !finalizedResults.length) {
      return;
    }

    hasPersistedRef.current = true;

    startTransition(async () => {
      try {
        const persisted = await submitSpotCheckResultsAction({
          wordListId,
          timeLimitSeconds,
          elapsedSeconds,
          results: finalizedResults.map((item) => ({
            wordId: item.wordId,
            userAnswer: item.userAnswer,
          })),
        });

        setReport(persisted);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "抽验报告保存失败");
      }
    });
  }, [elapsedSeconds, finalizedResults, finished, timeLimitSeconds, wordListId]);

  const accuracyRate = useMemo(() => {
    const total = report?.total ?? finalizedResults.length;
    const correct = report?.correctCount ?? finalizedResults.filter((item) => item.isCorrect).length;
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  }, [finalizedResults, report]);

  const beginSession = () => {
    const normalizedCount = Math.min(Math.max(1, wordCount), words.length);
    const selectedQuestions = shuffleWords(words).slice(0, normalizedCount);

    setQuestions(selectedQuestions);
    setCurrentIndex(0);
    setAnswer("");
    setFeedback(null);
    setResults([]);
    setElapsedSeconds(0);
    setRemainingSeconds(timeLimitSeconds);
    setFinished(false);
    setStarted(true);
    setReport(null);
    setLoadError(null);
    setAudioNotice(null);
    hasPersistedRef.current = false;
    lastAutoPlayedWordIdRef.current = null;
    startTimeRef.current = Date.now();

    if (questionMode === "audio" && selectedQuestions[0]) {
      lastAutoPlayedWordIdRef.current = selectedQuestions[0].id;
      window.setTimeout(() => {
        void playWordAudio({
          word: selectedQuestions[0].word,
          audioUrl: selectedQuestions[0].pronunciationAudioUrl,
          audioRef,
          preferredSource: pronunciationSource,
        })
          .then((playedWith) => {
            setAudioNotice(playedWith === "tts" ? "未找到词典音频，将使用系统语音朗读。" : null);
          })
          .catch((error) => {
            setAudioNotice(
              error instanceof Error ? error.message : "当前无法播放读音，请稍后重试或切换读音来源。",
            );
          })
          .finally(() => {
            setIsPlaying(false);
          });
      }, 0);
      setIsPlaying(true);
    }
  };

  const submitCurrentAnswer = () => {
    if (!currentWord || !answer.trim()) {
      return;
    }

    const normalizedAnswer = answer.trim().toLowerCase().replace(/\s+/g, " ");
    const isCorrect = currentWord.acceptedAnswers.includes(normalizedAnswer);

    setFeedback({
      wordId: currentWord.id,
      userAnswer: normalizedAnswer,
      isCorrect,
      correctWord: currentWord.word,
      meaning: currentWord.meaning,
    });
  };

  const goNext = () => {
    if (!feedback) {
      return;
    }

    const nextResults = [...results, feedback];
    setResults(nextResults);
    setFeedback(null);
    setAnswer("");

    if (currentIndex >= questions.length - 1) {
      setFinished(true);
      return;
    }

    setCurrentIndex((value) => value + 1);
  };

  const restartSession = () => {
    beginSession();
  };

  if (!words.length) {
    return (
      <Card className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-12 text-center">
          <p className="text-lg font-semibold text-slate-900">当前词库暂无可抽验单词</p>
          <p className="mt-2 text-sm text-slate-500">请先回到词库页补充单词，再进入抽验模式。</p>
        </div>
      </Card>
    );
  }

  if (!started) {
    return (
      <Card className="mx-auto max-w-3xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-brand-700">单词抽验</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{wordListName}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            从当前词库中随机抽取单词进行拼写抽验。你可以选择汉译英或读音检测，并自由设置题量和作答时长。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-700">抽验设置</p>
            <div className="mt-4 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">抽验方式</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setQuestionMode("meaning")}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      questionMode === "meaning"
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    汉译英
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionMode("audio")}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      questionMode === "audio"
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    读音检测
                  </button>
                </div>
              </label>

              {questionMode === "audio" ? (
                <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
                  <PronunciationSourceSelect
                    value={pronunciationSource}
                    onChange={setPronunciationSource}
                    compact
                  />
                </div>
              ) : null}

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">抽验单词数量</span>
                <Input
                  type="number"
                  min={1}
                  max={words.length}
                  value={wordCount}
                  onChange={(event) => setWordCount(Number(event.target.value) || 1)}
                />
                <p className="text-xs text-slate-500">当前词库共有 {words.length} 个单词。</p>
              </label>

              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-700">作答时间</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setTimeMode("unlimited")}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      timeMode === "unlimited"
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    不限时
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeMode("limited")}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      timeMode === "limited"
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    限时作答
                  </button>
                </div>
              </div>

              {timeMode === "limited" ? (
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">时长（分钟）</span>
                  <Input
                    type="number"
                    min={1}
                    max={120}
                    value={timeMinutes}
                    onChange={(event) => setTimeMinutes(Number(event.target.value) || 1)}
                  />
                </label>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-medium text-brand-700">本轮会生成的报告</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>会统计本轮正确率、正确数量、错误数量与总题数。</li>
              <li>会展示错误单词、你的作答和正确答案，便于复盘。</li>
              <li>错误单词会自动进入错题本，后续可继续复习。</li>
              <li>抽验记录会写入学习记录，并归档为独立测试模式。</li>
              <li>{questionMode === "audio" ? "每切换到下一题时会自动播放一次读音。" : "每题会展示中文释义，适合快速默写抽查。"}</li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={beginSession}>开始抽验</Button>
              <Button variant="secondary" asChild>
                <Link href={`/test/${wordListId}`}>返回模式选择</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (finished) {
    const displayedMistakes = report?.mistakes ?? finalizedResults.filter((item) => !item.isCorrect);
    const displayedTotal = report?.total ?? finalizedResults.length;
    const displayedCorrect = report?.correctCount ?? finalizedResults.filter((item) => item.isCorrect).length;
    const displayedWrong = report?.wrongCount ?? finalizedResults.filter((item) => !item.isCorrect).length;
    const unansweredCount = Math.max(0, questions.length - displayedTotal);

    return (
      <Card className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-brand-700">抽验报告</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{wordListName}</h1>
          <p className="mt-2 text-sm text-slate-500">本轮抽验已结束，可以直接查看结果并决定是否重新来一轮。</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl bg-emerald-50 px-5 py-5">
            <p className="text-sm text-emerald-700">正确率</p>
            <p className="mt-2 text-3xl font-black text-emerald-900">{accuracyRate}%</p>
          </div>
          <div className="rounded-3xl bg-slate-100 px-5 py-5">
            <p className="text-sm text-slate-600">总题数</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{questions.length}</p>
          </div>
          <div className="rounded-3xl bg-emerald-50 px-5 py-5">
            <p className="text-sm text-emerald-700">答对</p>
            <p className="mt-2 text-3xl font-black text-emerald-900">{displayedCorrect}</p>
          </div>
          <div className="rounded-3xl bg-rose-50 px-5 py-5">
            <p className="text-sm text-rose-700">答错</p>
            <p className="mt-2 text-3xl font-black text-rose-900">{displayedWrong}</p>
          </div>
          <div className="rounded-3xl bg-amber-50 px-5 py-5">
            <p className="text-sm text-amber-700">用时</p>
            <p className="mt-2 text-3xl font-black text-amber-900">{formatDuration(report?.elapsedSeconds ?? elapsedSeconds)}</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <span>已作答 {displayedTotal} 题</span>
            <span>未作答 {unansweredCount} 题</span>
            <span>{timeLimitSeconds ? `设定时长 ${timeMinutes} 分钟` : "不限时模式"}</span>
            <span>{questionMode === "audio" ? "读音检测" : "汉译英"}</span>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
          <p className="text-lg font-bold text-slate-950">错误单词</p>
          <div className="mt-4 space-y-3">
            {displayedMistakes.length ? (
              displayedMistakes.map((item) => (
                <div key={item.wordId} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4">
                  <p className="font-semibold text-rose-900">
                    {item.correctWord} · {item.meaning}
                  </p>
                  <p className="mt-2 text-sm text-rose-700">你的答案：{item.userAnswer || "未作答"}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 px-4 py-10 text-center text-sm text-emerald-700">
                本轮抽验没有错词，表现很稳。
              </div>
            )}
          </div>
        </div>

        {loadError ? (
          <div className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{loadError}</div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={restartSession} disabled={isPending}>
            再抽验一轮
          </Button>
          <Button variant="secondary" asChild>
            <Link href={`/test/${wordListId}`}>返回模式选择</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/mistakes">查看错题本</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-700">单词抽验进行中</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{wordListName}</h1>
          <p className="mt-2 text-sm text-slate-500">当前进度：{progressLabel}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {timeLimitSeconds ? "剩余时间" : "已用时间"}
          </p>
          <p className="mt-2 text-2xl font-black text-slate-950">
            {timeLimitSeconds ? formatDuration(remainingSeconds ?? 0) : formatDuration(elapsedSeconds)}
          </p>
        </div>
      </div>

      {questionMode === "audio" ? (
        <div className="rounded-3xl bg-slate-700 p-6 text-white">
          <div className="rounded-2xl bg-white/95 p-4 text-slate-950">
            <PronunciationSourceSelect value={pronunciationSource} onChange={setPronunciationSource} compact />
          </div>
          <Button
            className="mt-4 h-16 w-full text-lg"
            disabled={isPlaying}
            onClick={() => {
              void playCurrentWord("manual");
            }}
          >
            {isPlaying ? "播放中..." : pronunciationSource === "tts" ? "再听一次（系统语音）" : "再听一次"}
          </Button>
          <p className="mt-3 text-sm text-slate-300">
            {audioNotice || "当前题目会在切换时自动播放一次读音，也可以随时点击上方按钮重复播放。"}
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-6">
          <p className="text-sm font-medium text-brand-700">中文提示</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{currentWord?.meaning}</p>
          {currentWord?.partOfSpeech || currentWord?.phonetic ? (
            <p className="mt-3 text-sm text-slate-500">
              {[currentWord.partOfSpeech, currentWord.phonetic].filter(Boolean).join(" · ")}
            </p>
          ) : null}
        </div>
      )}

      <div className="mt-6 space-y-3">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">请输入英文单词拼写</span>
          <Input
            ref={inputRef}
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                event.preventDefault();
                if (feedback) {
                  goNext();
                } else {
                  submitCurrentAnswer();
                }
              }
            }}
            placeholder="输入对应的英文单词"
            className="h-14 text-base"
            disabled={Boolean(feedback)}
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <Button onClick={submitCurrentAnswer} disabled={!answer.trim() || Boolean(feedback)}>
            提交答案
          </Button>
          <Button variant="secondary" onClick={goNext} disabled={!feedback}>
            {currentIndex >= questions.length - 1 ? "完成抽验" : "下一题"}
          </Button>
          <Button variant="ghost" asChild>
            <Link href={`/test/${wordListId}`}>结束并返回</Link>
          </Button>
        </div>
      </div>

      {feedback ? (
        <div
          className={`mt-6 rounded-3xl px-5 py-5 ${
            feedback.isCorrect ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
          }`}
        >
          <p className="text-lg font-semibold">{feedback.isCorrect ? "回答正确" : "回答错误"}</p>
          <p className="mt-2 text-sm">
            你的答案：{feedback.userAnswer} · 正确拼写：{feedback.correctWord} · 中文含义：{feedback.meaning}
          </p>
        </div>
      ) : null}

      {loadError ? (
        <div className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{loadError}</div>
      ) : null}
    </Card>
  );
}
