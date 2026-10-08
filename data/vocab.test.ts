import { describe, expect, it } from "vitest";
import { handmadeLessonCount, n5Lessons } from "./lessons";
import { n5Vocab } from "./vocabulary";

const HIRAGANA = /^[\u3040-\u309fー・]+$/;

describe("data/vocab/n5.json", () => {
  it("每筆都有必要欄位", () => {
    for (const entry of n5Vocab) {
      expect(entry.id, entry.word).toBeTruthy();
      expect(entry.word, entry.id).toBeTruthy();
      expect(entry.meaning_zh.trim(), entry.word).not.toBe("");
      expect(entry.meaning_en.trim() !== "" || entry.source === "curated", entry.word).toBe(true);
      expect(entry.theme, entry.word).toBeTruthy();
    }
  });

  it("讀音一律為平假名（片假名單字也用平假名）", () => {
    for (const entry of n5Vocab) expect(entry.reading, entry.word).toMatch(HIRAGANA);
  });

  it("ID 唯一、順序編號連續", () => {
    expect(new Set(n5Vocab.map((entry) => entry.id)).size).toBe(n5Vocab.length);
    n5Vocab.forEach((entry, index) => expect(entry.order).toBe(index + 1));
  });

  it("沒有重複的「單字＋讀音」", () => {
    const keys = n5Vocab.map((entry) => `${entry.word}|${entry.reading}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("每個單字最多兩句例句，且例句有日文與英文", () => {
    for (const entry of n5Vocab) {
      expect(entry.examples.length, entry.word).toBeLessThanOrEqual(2);
      for (const example of entry.examples) {
        expect(example.ja, entry.word).toBeTruthy();
        expect(example.en, entry.word).toBeTruthy();
      }
    }
  });
});

describe("n5Lessons", () => {
  it("人工編排的 30 課維持原樣，且與詞庫中的人工編排單字一致", () => {
    expect(handmadeLessonCount).toBe(30);
    const handmade = n5Lessons.slice(0, handmadeLessonCount).flatMap((lesson) => lesson.words);
    const curated = n5Vocab.filter((entry) => entry.source === "curated");
    expect(curated.length).toBe(handmade.length);
    curated.forEach((entry, index) => {
      expect(handmade[index].japanese).toBe(entry.word);
      expect(handmade[index].reading).toBe(entry.reading);
      expect(handmade[index].meaning).toBe(entry.meaning_zh);
    });
  });

  it("新增單字全部分進課程，沒有遺漏或重複", () => {
    const added = n5Vocab.filter((entry) => entry.source === "openjlpt");
    const lessonWords = n5Lessons.slice(handmadeLessonCount).flatMap((lesson) => lesson.words);
    expect(lessonWords.length).toBe(added.length);
    expect(lessonWords.map((word) => word.japanese)).toEqual(added.map((entry) => entry.word));
  });

  it("新增的課只有單字、沒有文法，每課 5～19 個單字", () => {
    for (const lesson of n5Lessons.slice(handmadeLessonCount)) {
      expect(lesson.grammar).toHaveLength(0);
      expect(lesson.words.length).toBeGreaterThanOrEqual(5);
      expect(lesson.words.length).toBeLessThan(20);
    }
  });

  it("所有課程的單字都有完整欄位", () => {
    for (const lesson of n5Lessons) {
      for (const word of lesson.words) {
        expect(word.japanese).toBeTruthy();
        expect(word.reading).toMatch(HIRAGANA);
        expect(word.meaning).toBeTruthy();
      }
    }
  });
});
