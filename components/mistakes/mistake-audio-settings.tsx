"use client";

import { useEffect, useState } from "react";

import { PronunciationSourceSelect } from "@/components/audio/pronunciation-source-select";
import { type PronunciationSource } from "@/lib/audio-source";
import { getStoredPronunciationSource } from "@/lib/play-word-audio";

export function MistakeAudioSettings() {
  const [pronunciationSource, setPronunciationSource] = useState<PronunciationSource>("auto");

  useEffect(() => {
    setPronunciationSource(getStoredPronunciationSource());
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
      <PronunciationSourceSelect value={pronunciationSource} onChange={setPronunciationSource} compact />
    </div>
  );
}
