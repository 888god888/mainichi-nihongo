#!/usr/bin/env node
// 下載 JMdict（scriptin/jmdict-simplified 的「常用字」英文版）到 scripts/vocab/.cache/。
// 需要系統有 tar 指令（macOS、Linux 與 Windows 10 以上內建）。

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const cacheDir = path.join(here, ".cache");
const target = path.join(cacheDir, "jmdict-eng-common.json");

const latest = await fetch("https://github.com/scriptin/jmdict-simplified/releases/latest", { redirect: "manual" });
const location = latest.headers.get("location");
if (!location) throw new Error("無法取得 jmdict-simplified 最新版本");
const tag = decodeURIComponent(location.split("/tag/")[1]);

const assets = await (await fetch(`https://github.com/scriptin/jmdict-simplified/releases/expanded_assets/${encodeURIComponent(tag)}`)).text();
const match = assets.match(/href="([^"]*jmdict-eng-common-[^"]*\.json\.tgz)"/);
if (!match) throw new Error("找不到 jmdict-eng-common 壓縮檔");
const url = new URL(match[1].replaceAll("+", "%2B"), "https://github.com").toString();

console.log(`下載 ${tag} …`);
const response = await fetch(url);
if (!response.ok) throw new Error(`下載失敗：HTTP ${response.status}`);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "jmdict-"));
const archive = path.join(tmp, "jmdict.tgz");
fs.writeFileSync(archive, Buffer.from(await response.arrayBuffer()));
execFileSync("tar", ["-xzf", archive, "-C", tmp]);

const json = fs.readdirSync(tmp).find((name) => name.endsWith(".json"));
if (!json) throw new Error("壓縮檔內找不到 JSON");
fs.mkdirSync(cacheDir, { recursive: true });
fs.copyFileSync(path.join(tmp, json), target);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`已儲存 ${path.relative(process.cwd(), target)}`);
