import n5Json from "./vocab/n5.json";

// data/vocab/*.json 由 scripts/vocab/build-vocab.mjs 產生，請勿手動編輯。
export type VocabEntry = {
  id: string;
  level: string;
  word: string;
  reading: string;
  altWords?: string[];
  altReadings?: string[];
  pos: string[];
  meaning_zh: string;
  meaning_en: string;
  examples: { ja: string; en: string }[];
  theme: string;
  source: "curated" | "openjlpt";
  lesson?: number;
  order: number;
};

export const n5Vocab = n5Json as VocabEntry[];
