export const testModes = ["audio_to_word", "meaning_to_word"] as const;

export type TestMode = (typeof testModes)[number];

export function isTestMode(value: string): value is TestMode {
  return testModes.includes(value as TestMode);
}

export function getTestModeMeta(mode: TestMode) {
  if (mode === "meaning_to_word") {
    return {
      label: "汉语 -> 英语",
      description: "展示中文含义，输入对应的英文单词。",
    };
  }

  return {
    label: "语音 -> 英语",
    description: "保留现有听音拼写模式，先听音频再输入单词。",
  };
}
