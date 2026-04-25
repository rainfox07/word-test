"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { playWordAudio } from "@/lib/play-word-audio";

export function MistakeAudioButton({ audioUrl, word }: { audioUrl: string | null; word: string }) {
  const [notice, setNotice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = async () => {
    try {
      const playedWith = await playWordAudio({
        word,
        audioUrl,
        audioRef,
      });

      setNotice(playedWith === "tts" ? "未找到词典音频，将使用系统语音朗读。" : null);
    } catch {
      setNotice("发音播放失败，请稍后重试");
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
