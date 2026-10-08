# 每日日本語

Safari 可加入主畫面的每日學習 PWA。前 30 課是人工編排的 10 個單字加 3 個文法；第 31 課起是由詞庫自動分課的單字課（每課 10 字），並以 Supabase 帳號同步學習進度。今天學哪一課，是接續你上一次完成的那一課。

## Supabase 一次性設定

1. 開啟 Supabase Dashboard 的 **SQL Editor**。
2. 建立 New query，貼上 `supabase/schema.sql` 全部內容並按 **Run**。
3. 前往 **Authentication → Sign In / Providers → Email**。
4. 保持 Email provider 開啟，將 **Confirm email** 關閉並儲存。

APP 畫面只要求帳號與密碼。程式會把帳號轉為不可逆的內部識別 Email，使用者不需要提供真實 Email。

## GitHub Pages

1. 將專案上傳到 GitHub 的 `main` 分支。
2. 開啟 Repository **Settings → Pages**。
3. Source 選擇 **GitHub Actions**。
4. 等待 `Deploy GitHub Pages` workflow 完成。

若使用 `username.github.io/repository-name/` 專案網址，建置流程會自動加入 repository 路徑。

## 本機執行

複製 `.env.example` 為 `.env.local`，填入 Supabase Project URL 與 Publishable key，然後執行：

```bash
npm install
npm run dev
```

請勿將 Supabase Secret key、`service_role` 或 Database Password 放進網頁或 GitHub。

## 詞庫與資料來源

單字資料放在 `data/vocab/n5.json`，由 `scripts/vocab/` 底下的腳本產生，**請不要手動編輯這個檔案**。

```text
scripts/vocab/
├── sources/openjlpt-n5.json   上游 OpenJLPT 清單（快照，含授權說明 NOTICE.md）
├── curated.json               人工編排的 300 字（第 1～30 課）
├── zh-n5.json                 新單字的繁體中文釋義（人工／AI 產生後審核）
├── fixes-n5.json              上游資料的人工修正：drop 不收錄、override 覆寫、keep 保留
├── order-n5.json              新單字的學習順序（主題），其餘依詞性分組
├── fetch-jmdict.mjs           下載 JMdict（只需要一次）
└── build-vocab.mjs            合併、比對、驗證並輸出 data/vocab/n5.json
```

```bash
npm run vocab:fetch    # 下載 JMdict 到 scripts/vocab/.cache/（不會提交到 Git）
npm run vocab:build    # 重新產生 data/vocab/n5.json
npm run vocab:check    # 只檢查輸出檔是否與來源一致
```

腳本會用 JMdict 為每個單字配上穩定 ID 與詞性，挑掉與人工編排單字重複的詞條，並在缺少中文釋義、讀音不是平假名、ID 重複時回報錯誤。

**新增單字或等級（例如 N4）：**

1. 把 OpenJLPT 的 `n4.json` 放進 `sources/openjlpt-n4.json`。
2. 執行 `node scripts/vocab/build-vocab.mjs --level n4`，缺少中文釋義的單字會列在錯誤報告中。
3. 補上 `zh-n4.json`（鍵為 `原始單字|原始讀音`），並視需要建立 `fixes-n4.json`、`order-n4.json`。
4. 重新執行直到沒有錯誤。中文釋義請抽查，特別是腳本標示「多個詞條相符」的單字。

> JLPT 主辦單位沒有公布官方單字表，這裡的 N5／N4 等級是依 Jonathan Waller 的社群清單整理，屬於非官方分級。

### 授權與出處

- 單字與讀音：[JMdict／EDICT](https://www.edrdg.org/)（EDRDG，CC BY-SA 4.0）。
- JLPT 等級：[Jonathan Waller 的 JLPT 清單](https://www.tanos.co.uk/jlpt/)（CC BY）。
- 整理後的資料集：[OpenJLPT](https://pypi.org/project/openjlpt/)（CC BY-SA 4.0）。
- 例句：[Tatoeba](https://tatoeba.org)（CC BY 2.0 FR）。

因為使用了 CC BY-SA 4.0 的資料，`data/vocab/` 底下由這些來源衍生的詞庫資料，散布時也須以 CC BY-SA 4.0 授權並標示出處；程式碼本身的授權不受影響。App 底部已列出出處。詳見 `scripts/vocab/sources/NOTICE.md`。

## 測試與檢查

```bash
npm run typecheck
npm test
```

部署流程（推送到 `main`）會先執行型別檢查與測試再建置；其他分支與 Pull Request 由 `CI` workflow 執行同樣的檢查。

