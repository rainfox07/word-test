import type { MutableRefObject } from "react";

type PlayWordAudioInput = {
  word: string;
  audioUrl: string | null;
  audioRef: MutableRefObject<HTMLAudioElement | null>;
};

export async function playWordAudio({
  word,
  audioUrl,
  audioRef,
}: PlayWordAudioInput): Promise<"dictionary" | "tts"> {
  if (audioUrl) {
    window.speechSynthesis?.cancel();

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
    } else if (audioRef.current.src !== audioUrl) {
      audioRef.current.pause();
      audioRef.current = new Audio(audioUrl);
    }

    audioRef.current.currentTime = 0;
    await audioRef.current.play();
    return "dictionary";
  }

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

  return "tts";
}
