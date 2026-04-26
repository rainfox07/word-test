"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { getStoredPronunciationSource, playWordAudio } from "@/lib/play-word-audio";

export function MistakeAudioButton({ audioUrl, word }: { audioUrl: string | null; word: string }) {
  const [notice, setNotice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = async () => {
    try {
      const playedWith = await playWordAudio({
        word,
        audioUrl,
        audioRef,
        preferredSource: getStoredPronunciationSource(),
      });

      setNotice(playedWith === "tts" ? "未找到词典音频，将使用系统语音朗读。" : null);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "当前无法播放读音，请稍后重试或切换读音来源",
      );
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <Button variant="secondary" onClick={handlePlay}>
        播放发音
      </Button>
      {notice ? <p className="text-xs text-slate-500">{notice}</p> : null}
    </div>
  );
}
