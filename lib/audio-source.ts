export const pronunciationSourceOptions = [
  {
    value: "auto",
    label: "自动选择",
    description: "推荐，系统会自动寻找可用读音",
  },
  {
    value: "youdao",
    label: "有道发音",
    description: "国内访问较快，适合普通单词",
  },
  {
    value: "free_dictionary",
    label: "Free Dictionary",
    description: "词典音频，部分单词可能无音频",
  },
  {
    value: "tts",
    label: "浏览器 TTS",
    description: "稳定兜底，但声音取决于用户设备",
  },
] as const;

export type PronunciationSource = (typeof pronunciationSourceOptions)[number]["value"];

export const pronunciationSourceStorageKey = "word-test:pronunciation-source";
