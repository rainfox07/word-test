import type { MutableRefObject } from "react";

import { pronunciationSourceStorageKey, type PronunciationSource } from "@/lib/audio-source";
import { extractAudioUrl, normalizeAudioUrl, type DictionaryEntry } from "@/lib/extract-audio-url";

type PlayWordAudioInput = {
  word: string;
  audioUrl: string | null;
  audioRef: MutableRefObject<HTMLAudioElement | null>;
  preferredSource?: PronunciationSource;
};

const FREE_DICTIONARY_API_BASE_URL =
  process.env.NEXT_PUBLIC_DICTIONARY_API_BASE_URL ?? "https://api.dictionaryapi.dev/api/v2/entries/en";

function getYoudaoAudioUrl(word: string) {
  const normalizedWord = word.trim();

  if (!normalizedWord) {
    return null;
  }

  return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(normalizedWord)}&type=2`;
}

async function playAudioElement(audioRef: MutableRefObject<HTMLAudioElement | null>, audioUrl: string) {
  window.speechSynthesis?.cancel();

  if (!audioRef.current) {
    audioRef.current = new Audio(audioUrl);
  } else if (audioRef.current.src !== audioUrl) {
    audioRef.current.pause();
    audioRef.current = new Audio(audioUrl);
  }

  audioRef.current.currentTime = 0;
  await audioRef.current.play();
}

async function fetchFreeDictionaryAudioUrl(word: string, currentAudioUrl: string | null) {
  const normalizedCurrentAudioUrl = normalizeAudioUrl(currentAudioUrl);

  if (normalizedCurrentAudioUrl) {
    return normalizedCurrentAudioUrl;
  }

  const response = await fetch(`${FREE_DICTIONARY_API_BASE_URL}/${encodeURIComponent(word.trim().toLowerCase())}`);

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as DictionaryEntry[];
  return extractAudioUrl(payload);
}

async function playWithTts(word: string) {
  if (!("speechSynthesis" in window)) {
    throw new Error("当前浏览器不支持系统语音朗读");
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(word.trim());
  utterance.lang = "en-US";
  utterance.rate = 0.92;

  await new Promise<void>((resolve, reject) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error("系统语音朗读失败"));
    window.speechSynthesis.speak(utterance);
  });
}

export async function playWordAudio({
  word,
  audioUrl,
  audioRef,
  preferredSource = "auto",
}: PlayWordAudioInput): Promise<PronunciationSource> {
  const normalizedWord = word.trim();

  if (!normalizedWord) {
    throw new Error("当前单词暂时无法播放，请稍后重试。");
  }

  const tryYoudao = async () => {
    const youdaoAudioUrl = getYoudaoAudioUrl(normalizedWord);

    if (!youdaoAudioUrl) {
      throw new Error("有道发音不可用");
    }

    await playAudioElement(audioRef, youdaoAudioUrl);
    return "youdao" as const;
  };

  const tryFreeDictionary = async () => {
    const dictionaryAudioUrl = await fetchFreeDictionaryAudioUrl(normalizedWord, audioUrl);

    if (!dictionaryAudioUrl) {
      throw new Error("未找到 Free Dictionary 音频");
    }

    await playAudioElement(audioRef, dictionaryAudioUrl);
    return "free_dictionary" as const;
  };

  const tryTts = async () => {
    await playWithTts(normalizedWord);
    return "tts" as const;
  };

  if (preferredSource === "youdao") {
    return tryYoudao();
  }

  if (preferredSource === "free_dictionary") {
    return tryFreeDictionary();
  }

  if (preferredSource === "tts") {
    return tryTts();
  }

  const candidates = [
    { source: "youdao" as const, run: tryYoudao },
    { source: "free_dictionary" as const, run: tryFreeDictionary },
    { source: "tts" as const, run: tryTts },
  ];

  for (const candidate of candidates) {
    try {
      const resolvedSource = await candidate.run();
      console.info("[word-audio:auto]", {
        word: normalizedWord,
        source: resolvedSource,
      });
      return resolvedSource;
    } catch {
      continue;
    }
  }

  throw new Error("当前无法播放读音，请稍后重试或切换读音来源");
}

export function getStoredPronunciationSource() {
  const storedValue = window.localStorage.getItem(pronunciationSourceStorageKey);

  if (
    storedValue === "auto" ||
    storedValue === "youdao" ||
    storedValue === "free_dictionary" ||
    storedValue === "tts"
  ) {
    return storedValue;
  }

  return "auto" as const;
}
