"use client";

import { Select } from "@/components/ui/select";
import {
  pronunciationSourceOptions,
  pronunciationSourceStorageKey,
  type PronunciationSource,
} from "@/lib/audio-source";

export function PronunciationSourceSelect({
  value,
  onChange,
  compact = false,
}: {
  value: PronunciationSource;
  onChange: (value: PronunciationSource) => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3 rounded-2xl border border-slate-200 bg-white px-4 py-4"}>
      <div>
        <p className="text-sm font-medium text-slate-700">读音来源</p>
        <p className="mt-1 text-xs leading-6 text-slate-500">
          当前选择会保存在本地，下次进入页面时自动恢复。默认使用自动模式。
        </p>
      </div>

      <Select
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value as PronunciationSource;
          window.localStorage.setItem(pronunciationSourceStorageKey, nextValue);
          onChange(nextValue);
        }}
      >
        {pronunciationSourceOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      {!compact ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {pronunciationSourceOptions.map((option) => (
            <div
              key={option.value}
              className={`rounded-2xl border px-3 py-3 text-xs leading-6 ${
                value === option.value
                  ? "border-brand-200 bg-brand-50 text-brand-800"
                  : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
            >
              <p className="font-semibold">{option.label}</p>
              <p className="mt-1">{option.description}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
