export const testModes = ["audio_to_word", "meaning_to_word", "word_reader"] as const;

export type TestMode = (typeof testModes)[number];

export function isTestMode(value: string): value is TestMode {
  return testModes.includes(value as TestMode);
}

export function getTestModeMeta(mode: TestMode) {
  if (mode === "word_reader") {
    return {
      title: "单词领读",
      label: "单词领读",
      description: "按词库顺序展示单词与中文释义，并自动朗读单词发音。",
    };
  }

  if (mode === "meaning_to_word") {
    return {
      title: "汉语 -> 英语",
      label: "汉语 -> 英语",
      description: "展示中文含义，输入对应的英文单词。",
    };
  }

  return {
    title: "语音 -> 英语",
    label: "语音 -> 英语",
    description: "保留现有听音拼写模式，先听音频再输入单词。",
  };
}
