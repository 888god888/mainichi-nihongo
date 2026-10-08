#!/usr/bin/env node
// 詞庫產生腳本：把「人工編排的 300 字」與 OpenJLPT 清單合併，
// 再用 JMdict 補上穩定 ID、詞性，並檢查資料品質，輸出 data/vocab/<level>.json。
//
// 用法：
//   npm run vocab:fetch                      # 先下載 JMdict（只需一次）
//   npm run vocab:build                      # 產生 data/vocab/n5.json
//   node scripts/vocab/build-vocab.mjs --level n5 --check   # 只檢查，不寫檔（CI 用）
//
// 新增等級（例如 N4）：放入 sources/openjlpt-n4.json，建立 zh-n4.json、fixes-n4.json、
// order-n4.json，執行腳本；缺少中文釋義的單字會被列在錯誤報告裡。

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const level = option("level", "n5").toLowerCase();
const jmdictPath = path.resolve(root, option("jmdict", "scripts/vocab/.cache/jmdict-eng-common.json"));
const outPath = path.join(root, "data/vocab", `${level}.json`);
const checkOnly = flag("check");

// ---------- 小工具 ----------

const readJson = (file, fallback) => {
  if (!fs.existsSync(file)) {
    if (fallback !== undefined) return fallback;
    throw new Error(`找不到檔案：${path.relative(root, file)}`);
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
};

const toHiragana = (text) =>
  text.replace(/[\u30a1-\u30f6]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60));

const KANA_ONLY = /^[\u3040-\u309f\u30a0-\u30ffー・]+$/;
const HIRAGANA_READING = /^[\u3040-\u309fー・]+$/;
const isKana = (text) => KANA_ONLY.test(text);
const splitForms = (text) => text.split(/\s*[/／]\s*|\s+/).map((part) => part.trim()).filter(Boolean);

const STOP_WORDS = new Set(["to", "a", "an", "the", "of", "or", "be", "one", "in", "on", "for", "with", "and", "is"]);
const tokens = (text) =>
  new Set(
    text
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter((token) => token && !STOP_WORDS.has(token))
  );

// 例句過濾：不適合初學者的粗俗或負面內容。
const UNSUITABLE_EXAMPLE = /\b(hell|damn|shit|fuck|kill|suicide|sex|drunk|die|dead|death|murder|go away|get out|shut up|stupid|idiot)\b/i;

const hashId = (text) => {
  let hash = 2166136261;
  for (const char of text) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
};

// ---------- 載入資料 ----------

const source = readJson(path.join(here, "sources", `openjlpt-${level}.json`));
const curated = level === "n5" ? readJson(path.join(here, "curated.json")) : [];
const zhMap = readJson(path.join(here, `zh-${level}.json`), {});
const fixes = readJson(path.join(here, `fixes-${level}.json`), { drop: {}, override: {} });
const orderConfig = readJson(path.join(here, `order-${level}.json`), { themes: [] });
const previous = readJson(outPath, []);
const previousIds = new Map(previous.map((entry) => [`${entry.word}|${entry.reading}`, entry.id]));

if (!fs.existsSync(jmdictPath)) {
  console.error(`找不到 JMdict：${path.relative(root, jmdictPath)}\n請先執行：npm run vocab:fetch`);
  process.exit(2);
}
const jmdict = readJson(jmdictPath);

// ---------- JMdict 索引 ----------

const byKanji = new Map();
const byKana = new Map();
const add = (map, key, entry) => {
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(entry);
};

for (const entry of jmdict.words) {
  const info = {
    id: entry.id,
    kanji: entry.kanji.map((k) => k.text),
    kana: entry.kana.map((k) => toHiragana(k.text)),
    common: entry.kanji.some((k) => k.common) || entry.kana.some((k) => k.common),
    pos: [...new Set(entry.sense.flatMap((sense) => sense.partOfSpeech))],
    glossTokens: tokens(entry.sense.flatMap((sense) => sense.gloss.map((g) => g.text)).join(" ")),
    firstGloss: entry.sense[0]?.gloss.map((g) => g.text).slice(0, 3).join("; ") ?? "",
  };
  for (const text of info.kanji) add(byKanji, text, info);
  for (const text of info.kana) add(byKana, text, info);
}

function resolveEntry(forms, reading, english) {
  const candidates = new Set();
  for (const form of forms) {
    for (const entry of byKanji.get(form) ?? []) candidates.add(entry);
    if (isKana(form)) for (const entry of byKana.get(toHiragana(form)) ?? []) candidates.add(entry);
  }
  const matching = [...candidates].filter((entry) => entry.kana.includes(reading));
  if (matching.length === 0) return null;
  if (matching.length === 1) return { entry: matching[0], ambiguous: false };

  const englishTokens = tokens(english);
  const scored = matching
    .map((entry) => ({
      entry,
      score: [...englishTokens].filter((token) => entry.glossTokens.has(token)).length,
      viaKanji: forms.some((form) => entry.kanji.includes(form)) ? 1 : 0,
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.viaKanji - a.viaKanji ||
        Number(b.entry.common) - Number(a.entry.common) ||
        Number(a.entry.id) - Number(b.entry.id)
    );
  const ambiguous = scored[0].score === 0 || scored[0].score === scored[1].score;
  return { entry: scored[0].entry, ambiguous };
}

function posBucket(pos) {
  if (pos.some((tag) => /^v(1|5|k|z|s-i|s-s|s-c)/.test(tag))) return "動詞";
  if (pos.some((tag) => tag === "adj-i" || tag === "adj-ix")) return "い形容詞";
  if (pos.includes("adj-na")) return "な形容詞";
  if (pos.some((tag) => ["adv", "adv-to", "conj", "int", "pn", "prt", "ctr", "exp", "aux", "aux-v", "n-adv", "adj-pn"].includes(tag)) && !pos.includes("n")) {
    return "副詞與連接詞";
  }
  return "名詞";
}

// ---------- 正規化 ----------

const errors = [];
const warnings = [];
const dropped = [];

function normalizeSource(raw) {
  const rawKey = `${raw.word}|${raw.reading ?? ""}`;
  if (fixes.drop?.[rawKey]) {
    dropped.push(`${rawKey}（${fixes.drop[rawKey]}）`);
    return null;
  }
  const override = fixes.override?.[rawKey] ?? {};

  const wordForms = splitForms(override.word ?? raw.word);
  const word = wordForms[0];
  const readingForms = splitForms(override.reading ?? raw.reading ?? "").map(toHiragana);
  let reading = readingForms[0];
  if (!reading) {
    if (isKana(word)) reading = toHiragana(word);
    else {
      errors.push(`缺少讀音：${rawKey}`);
      return null;
    }
  }
  if (!word.endsWith("する") && reading.length > 2 && reading.endsWith("する")) {
    reading = reading.slice(0, -2); // 「勉強」「掃除」的讀音不含する
  }

  const meaningEn = override.meaning_en ?? raw.meanings.join("; ");
  const meaningZh = zhMap[rawKey];

  const examples = [];
  for (const example of raw.examples ?? []) {
    if (UNSUITABLE_EXAMPLE.test(example.en) || example.ja.length > 40) continue;
    if (examples.some((item) => item.ja === example.ja)) continue;
    examples.push({ ja: example.ja, en: example.en });
    if (examples.length === 2) break;
  }

  return {
    rawKey,
    word,
    reading,
    keys: [...new Set([reading, ...readingForms.slice(1)])].map((r) => `${word}|${r}`),
    altWords: wordForms.slice(1),
    altReadings: readingForms.slice(1),
    meaningEn,
    meaningZh,
    examples,
  };
}

// ---------- 合併 ----------

const entries = [];
const claimedIds = new Map();

function finalize(base, extra) {
  const forms = [base.word, ...(base.altWords ?? [])];
  const resolved = resolveEntry(forms, base.reading, base.meaningEn ?? "");
  const key = `${base.word}|${base.reading}`;
  let id = previousIds.get(key);
  let pos = [];
  if (resolved) {
    id = id ?? `jm${resolved.entry.id}`;
    pos = resolved.entry.pos;
    if (resolved.ambiguous) warnings.push(`多個 JMdict 詞條相符，已依釋義挑選：${key}`);
    if (!base.meaningEn) base.meaningEn = resolved.entry.firstGloss;
  } else {
    id = id ?? `x${hashId(key)}`;
    warnings.push(`JMdict 查無對應詞條（使用雜湊 ID）：${key}`);
  }
  // 不同單字可能共用同一個 JMdict 詞條（例如こちら／こっち），此時加上雜湊尾碼避免 ID 重複。
  if (claimedIds.has(id) && claimedIds.get(id) !== key) id = `${id}-${hashId(key).slice(0, 4)}`;
  claimedIds.set(id, key);
  return { id, jmdictId: resolved?.entry.id ?? null, pos, ...extra };
}

// 1) 人工編排的單字（保留原有中文釋義與課次）
const curatedKeys = new Set();
const curatedByJmdict = new Map();
const sourceByKey = new Map();
const sourceNorms = [];
for (const raw of source) {
  const norm = normalizeSource(raw);
  if (!norm) continue;
  sourceNorms.push(norm);
  for (const key of norm.keys) sourceByKey.set(key, norm);
}

for (const item of curated) {
  const key = `${item.japanese}|${item.reading}`;
  const match = sourceByKey.get(key);
  const base = { word: item.japanese, reading: item.reading, meaningEn: match?.meaningEn ?? "" };
  const info = finalize(base, {});
  const entry = {
    id: info.id,
    level: level.toUpperCase(),
    word: item.japanese,
    reading: item.reading,
    pos: info.pos,
    meaning_zh: item.meaning,
    meaning_en: base.meaningEn,
    examples: match?.examples ?? [],
    theme: `第 ${item.lesson} 課`,
    source: "curated",
    lesson: item.lesson,
    order: 0,
  };
  curatedKeys.add(key);
  if (info.jmdictId) curatedByJmdict.set(info.jmdictId, entry);
  entries.push(entry);
}

// 2) OpenJLPT 新單字：與人工編排單字重複者略過
const candidates = [];
for (const norm of sourceNorms) {
  if (norm.keys.some((key) => curatedKeys.has(key))) continue;
  const info = finalize(norm, {});
  const duplicate = info.jmdictId && curatedByJmdict.get(info.jmdictId);
  if (duplicate && !(fixes.keep ?? []).includes(norm.rawKey)) {
    dropped.push(`${norm.rawKey}（與人工編排的「${duplicate.word}」為同一詞條）`);
    continue;
  }
  if (!norm.meaningZh) errors.push(`缺少繁體中文釋義：${norm.rawKey}（${norm.meaningEn}）`);
  candidates.push({ norm, info });
}

// 3) 排序：主題優先，其餘依詞性分組
const themeOf = new Map();
orderConfig.themes.forEach((theme, themeIndex) => {
  theme.words.forEach((word, wordIndex) => {
    if (!themeOf.has(word)) themeOf.set(word, { name: theme.name, rank: themeIndex * 1000 + wordIndex });
  });
});
const bucketNames = orderConfig.fallbackBuckets ?? ["動詞", "い形容詞", "な形容詞", "副詞與連接詞", "名詞"];

const added = candidates.map(({ norm, info }) => {
  const themed = themeOf.get(norm.word);
  const bucket = posBucket(info.pos);
  const bucketIndex = Math.max(bucketNames.indexOf(bucket), 0);
  return {
    sortKey: themed ? themed.rank : 1_000_000 + bucketIndex * 100_000,
    tie: themed ? 0 : Number(info.jmdictId ?? 0),
    entry: {
      id: info.id,
      level: level.toUpperCase(),
      word: norm.word,
      reading: norm.reading,
      ...(norm.altWords.length ? { altWords: norm.altWords } : {}),
      ...(norm.altReadings.length ? { altReadings: norm.altReadings } : {}),
      pos: info.pos,
      meaning_zh: norm.meaningZh ?? "",
      meaning_en: norm.meaningEn,
      examples: norm.examples,
      theme: themed ? themed.name : bucket,
      source: "openjlpt",
      order: 0,
    },
  };
});
added.sort((a, b) => a.sortKey - b.sortKey || a.tie - b.tie);
entries.push(...added.map((item) => item.entry));

const unusedThemeWords = [...themeOf.keys()].filter(
  (word) => !entries.some((entry) => entry.word === word)
);
if (unusedThemeWords.length) warnings.push(`order 檔列出但詞庫中不存在的單字：${unusedThemeWords.join("、")}`);

entries.forEach((entry, index) => {
  entry.order = index + 1;
});

// ---------- 驗證 ----------

const seenIds = new Map();
for (const entry of entries) {
  if (seenIds.has(entry.id)) errors.push(`ID 重複：${entry.id}（${seenIds.get(entry.id)} / ${entry.word}）`);
  seenIds.set(entry.id, entry.word);
  if (!entry.meaning_zh) errors.push(`缺少中文釋義：${entry.word}`);
  if (!HIRAGANA_READING.test(entry.reading)) errors.push(`讀音不是平假名：${entry.word} → ${entry.reading}`);
}

// ---------- 輸出 ----------

const serialize = (list) => `[\n${list.map((entry) => `  ${JSON.stringify(entry)}`).join(",\n")}\n]\n`;
const output = serialize(entries);

const curatedCount = entries.filter((entry) => entry.source === "curated").length;
console.log(`等級 ${level.toUpperCase()}：共 ${entries.length} 字（人工編排 ${curatedCount}、新增 ${entries.length - curatedCount}）`);
console.log(`略過 ${dropped.length} 筆：`);
for (const line of dropped) console.log(`  - ${line}`);
if (warnings.length) {
  console.log(`警告 ${warnings.length} 筆：`);
  for (const line of warnings) console.log(`  - ${line}`);
}
if (errors.length) {
  console.error(`錯誤 ${errors.length} 筆：`);
  for (const line of errors) console.error(`  - ${line}`);
  process.exit(1);
}

if (checkOnly) {
  const current = fs.existsSync(outPath) ? fs.readFileSync(outPath, "utf8") : "";
  if (current !== output) {
    console.error(`${path.relative(root, outPath)} 與來源不同步，請執行 npm run vocab:build`);
    process.exit(1);
  }
  console.log("檢查通過：輸出檔與來源一致。");
} else {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, output, "utf8");
  console.log(`已寫入 ${path.relative(root, outPath)}`);
}
