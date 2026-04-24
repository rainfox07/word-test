"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";

export function MistakeAudioButton({ audioUrl }: { audioUrl: string | null }) {
  const [notice, setNotice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = async () => {
    if (!audioUrl) {
      setNotice("该单词暂无音频");
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
      setNotice(null);
    } catch {
      setNotice("音频播放失败，请稍后重试");
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
