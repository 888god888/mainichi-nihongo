# 每日日本語

Safari 可加入主畫面的每日學習 PWA。每天提供 10 個 N5 單字與 3 個文法，並以 Supabase 帳號同步學習進度。

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

