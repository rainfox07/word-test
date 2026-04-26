"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import { getTestQuestionAction, submitTestAnswerAction } from "@/app/actions/test-actions";
import { PronunciationSourceSelect } from "@/components/audio/pronunciation-source-select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type PronunciationSource } from "@/lib/audio-source";
import { getStoredPronunciationSource, playWordAudio } from "@/lib/play-word-audio";
import { TestMode, getTestModeMeta } from "@/lib/test-modes";

type TestRunnerProps = {
  wordListId: string;
  wordListName: string;
  testMode: TestMode;
};

type Question = {
  wordId: string;
  word: string;
  meaning: string;
  audioUrl: string | null;
  hasAudio: boolean;
  testMode: TestMode;
};

type AnswerFeedback = {
  isCorrect: boolean;
  userAnswer: string;
  correctWord: string;
  meaning: string;
  audioUrl: string | null;
};

type SessionStats = {
  correctCount: number;
  wrongCount: number;
  totalAnswered: number;
};

export function TestRunner({ wordListId, wordListName, testMode }: TestRunnerProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [usedWordIds, setUsedWordIds] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const [correctSoundEnabled, setCorrectSoundEnabled] = useState(true);
  const [pronunciationSource, setPronunciationSource] = useState<PronunciationSource>("auto");
  const [isTestStarted, setIsTestStarted] = useState(testMode !== "audio_to_word");
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(testMode !== "audio_to_word");
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlayFailed, setAutoPlayFailed] = useState(false);
  const [sessionStartedAt, setSessionStartedAt] = useState(() => Date.now());
  const [sessionFinishedAt, setSessionFinishedAt] = useState<number | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    correctCount: 0,
    wrongCount: 0,
    totalAnswered: 0,
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const successAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastAutoPlayedWordIdRef = useRef<string | null>(null);
  const modeMeta = getTestModeMeta(testMode);

  useEffect(() => {
    const storedValue = window.localStorage.getItem("word-test:correct-sound-enabled");

    if (storedValue === "false") {
      setCorrectSoundEnabled(false);
    }

    setPronunciationSource(getStoredPronunciationSource());
  }, []);

  const loadQuestion = (excludedIds: string[]) => {
    startTransition(async () => {
      try {
        const nextQuestion = await getTestQuestionAction(wordListId, excludedIds, testMode);
        setHasFetched(true);

        if (!nextQuestion) {
          stopCurrentPlayback();
          audioRef.current = null;
          setQuestion(null);
          setSessionFinishedAt((current) => current ?? Date.now());
          return;
        }

        setQuestion(nextQuestion);
        setAnswer("");
        setFeedback(null);
        setLoadError(null);
        setAudioNotice(null);
        setAutoAdvanceCountdown(null);
        setSessionFinishedAt(null);
        stopCurrentPlayback();
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

  const stopCurrentPlayback = () => {
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
  };

  const playAudio = async (
    options?: {
      mode?: "manual" | "auto";
      context?: "initial" | "next" | "retry" | "result";
      suppressNotice?: boolean;
      skipWhenLocked?: boolean;
    } & {
    audioUrl?: string | null;
    word?: string;
    },
  ) => {
    const audioUrl = options?.audioUrl ?? question?.audioUrl ?? feedback?.audioUrl;
    const word = options?.word ?? question?.word ?? feedback?.correctWord;
    const playbackMode = options?.mode ?? "manual";

    if (options?.skipWhenLocked && !isAudioUnlocked) {
      return;
    }

    if (!word) {
      setAudioNotice("当前单词暂时无法播放，请稍后重试。");
      return;
    }

    stopCurrentPlayback();
    setIsPlaying(true);

    try {
      const playedWith = await playWordAudio({
        word,
        audioUrl: audioUrl ?? null,
        audioRef,
        preferredSource: pronunciationSource,
      });

      setAutoPlayFailed(false);

      if (!options?.suppressNotice) {
        setAudioNotice(playedWith === "tts" ? "未找到词典音频，将使用系统语音朗读。" : null);
      }
    } catch (error) {
      if (playbackMode === "auto") {
        setAutoPlayFailed(true);
        setAudioNotice(
          autoPlayFailed
            ? "读音播放失败，请点击再听一次或切换读音来源。"
            : "浏览器可能阻止了自动播放，请点击再听一次，或在浏览器设置中允许本站播放声音。",
        );
        console.warn("[word-audio:auto-play-failed]", {
          source: pronunciationSource,
          word,
          context: options?.context ?? "next",
          error,
        });
      } else {
        setAudioNotice(
          error instanceof Error
            ? error.message
            : "当前无法播放读音，请稍后重试或切换读音来源",
        );
      }
    } finally {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (testMode !== "audio_to_word") {
      setAudioNotice(null);
    }
  }, [testMode]);

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
          testMode,
          userAnswer: answer,
        });

        setFeedback(result);
        setSessionStats((current) => ({
          correctCount: current.correctCount + (result.isCorrect ? 1 : 0),
          wrongCount: current.wrongCount + (result.isCorrect ? 0 : 1),
          totalAnswered: current.totalAnswered + 1,
        }));
        setUsedWordIds((current) =>
          current.includes(question.wordId) ? current : [...current, question.wordId],
        );
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "提交失败");
      }
    });
  };

  const playCorrectSound = async () => {
    if (!correctSoundEnabled) {
      return;
    }

    if (!successAudioRef.current) {
      successAudioRef.current = new Audio("/sounds/correct-answer.wav");
    }

    successAudioRef.current.currentTime = 0;

    try {
      await successAudioRef.current.play();
    } catch {
      // Ignore autoplay restrictions for the feedback sound.
    }
  };

  useEffect(() => {
    if (feedback?.isCorrect) {
      void playCorrectSound();
    }
  }, [feedback?.isCorrect]);

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
      stopCurrentPlayback();
    };
  }, []);

  useEffect(() => {
    if (testMode !== "audio_to_word" || !question || !isTestStarted || !isAudioUnlocked || feedback) {
      return;
    }

    if (lastAutoPlayedWordIdRef.current === question.wordId) {
      return;
    }

    lastAutoPlayedWordIdRef.current = question.wordId;

    void playAudio({
      mode: "auto",
      context: "next",
      word: question.word,
      audioUrl: question.audioUrl,
      skipWhenLocked: true,
      suppressNotice: false,
    });
  }, [question?.wordId, testMode, isTestStarted, isAudioUnlocked, feedback]);

  const durationSeconds = Math.max(
    1,
    Math.round(((sessionFinishedAt ?? Date.now()) - sessionStartedAt) / 1000),
  );
  const accuracyRate =
    sessionStats.totalAnswered > 0
      ? Math.round((sessionStats.correctCount / sessionStats.totalAnswered) * 100)
      : 0;

  return (
    <Card className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="text-sm font-medium text-brand-700">当前词库</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{wordListName}</h1>
        <p className="mt-2 text-sm text-slate-500">{modeMeta.description}</p>
      </div>

      {!hasFetched ? (
        <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500">
          正在加载测试题...
        </div>
      ) : testMode === "audio_to_word" && !isTestStarted ? (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-8">
            <p className="text-sm font-medium text-brand-700">启用单词读音</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">先开启音频，再开始听写</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              为了让系统在听写时自动播放每个单词的读音，请先点击下方按钮开启音频。部分浏览器可能会限制自动播放，
              如果没有声音，可以点击“再听一次”。
            </p>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <PronunciationSourceSelect value={pronunciationSource} onChange={setPronunciationSource} compact />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  if (question?.wordId) {
                    lastAutoPlayedWordIdRef.current = question.wordId;
                  }
                  setIsTestStarted(true);
                  setIsAudioUnlocked(true);
                  setSessionStartedAt(Date.now());
                  setAutoPlayFailed(false);
                  void playAudio({
                    mode: "manual",
                    context: "initial",
                    word: question?.word,
                    audioUrl: question?.audioUrl,
                  });
                }}
                disabled={!question}
              >
                开始听写并启用音频
              </Button>
              <Button variant="secondary" asChild>
                <Link href={`/test/${wordListId}`}>返回模式选择</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : question ? (
        <div className="space-y-6">
          {testMode === "audio_to_word" ? (
            <div className="rounded-3xl bg-slate-700 p-6 text-white">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-sm text-sky-200">音频练习区</p>
                  <p className="mt-2 text-sm text-slate-200">
                    当前题目会在切换后自动播放一次。如果没有声音，可以点击“再听一次”或切换读音来源。
                  </p>
                </div>

                <div className="rounded-2xl bg-white/95 p-4 text-slate-950">
                  <PronunciationSourceSelect
                    value={pronunciationSource}
                    onChange={setPronunciationSource}
                    compact
                  />
                </div>
              </div>
              <Button
                className="mt-4 h-16 w-full text-lg"
                disabled={isPlaying}
                onClick={() => {
                  void playAudio({
                    mode: "manual",
                    context: "retry",
                    word: question.word,
                    audioUrl: question.audioUrl,
                  });
                }}
              >
                {isPlaying ? "播放中..." : pronunciationSource === "tts" ? "再听一次（系统语音）" : "再听一次"}
              </Button>
              <p className="mt-3 text-sm text-slate-300">
                {audioNotice ||
                  "自动模式会依次尝试有道、Free Dictionary 和系统语音；播放失败不会影响你继续答题。"}
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-6">
              <p className="text-sm font-medium text-brand-700">中文提示</p>
              <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{question.meaning}</p>
            </div>
          )}

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
                placeholder={testMode === "meaning_to_word" ? "输入对应的英文单词" : "输入你听到的单词"}
                className="h-14 text-base"
                disabled={Boolean(feedback)}
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSubmit} disabled={isPending || !answer.trim() || Boolean(feedback)}>
                {isPending ? "提交中..." : "提交答案"}
              </Button>
              <Button
                variant="secondary"
                onClick={handleNext}
                disabled={isPending}
              >
                下一题
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  const nextValue = !correctSoundEnabled;
                  setCorrectSoundEnabled(nextValue);
                  window.localStorage.setItem("word-test:correct-sound-enabled", String(nextValue));
                }}
              >
                {correctSoundEnabled ? "关闭答对提示音" : "开启答对提示音"}
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
                        void playAudio({
                          mode: "manual",
                          context: "result",
                          audioUrl: feedback.audioUrl,
                          word: feedback.correctWord,
                        });
                      }}
                    >
                      播放该单词发音
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
        <div className="space-y-6">
          <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-slate-900">当前词库本轮测试已完成</p>
            <p className="mt-2 text-sm text-slate-500">
              可以回到词库页继续选择其他词库，或重新开始本词库。
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-brand-700">本次测试统计</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  正确率 {accuracyRate}%
                </h2>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                用时 {durationSeconds} 秒
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-4">
              <div className="rounded-2xl bg-emerald-50 px-4 py-4">
                <p className="text-sm text-emerald-700">正确</p>
                <p className="mt-2 text-2xl font-black text-emerald-900">
                  {sessionStats.correctCount}
                </p>
              </div>
              <div className="rounded-2xl bg-rose-50 px-4 py-4">
                <p className="text-sm text-rose-700">错误</p>
                <p className="mt-2 text-2xl font-black text-rose-900">{sessionStats.wrongCount}</p>
              </div>
              <div className="rounded-2xl bg-slate-100 px-4 py-4">
                <p className="text-sm text-slate-600">总题数</p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {sessionStats.totalAnswered}
                </p>
              </div>
              <div className="rounded-2xl bg-amber-50 px-4 py-4">
                <p className="text-sm text-amber-700">测试模式</p>
                <p className="mt-2 text-lg font-black text-amber-900">{modeMeta.title}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => {
                  setUsedWordIds([]);
                  setFeedback(null);
                  setAnswer("");
                  setSessionStartedAt(Date.now());
                  setSessionFinishedAt(null);
                  lastAutoPlayedWordIdRef.current = null;
                  setIsTestStarted(true);
                  setIsAudioUnlocked(true);
                  setAutoPlayFailed(false);
                  setSessionStats({
                    correctCount: 0,
                    wrongCount: 0,
                    totalAnswered: 0,
                  });
                  loadQuestion([]);
                }}
              >
                重新开始
              </Button>
              <Button variant="secondary" asChild>
                <Link href={`/test/${wordListId}`}>返回模式选择</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
