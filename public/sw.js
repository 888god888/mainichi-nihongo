const CACHE = "mainichi-nihongo-v6";
const APP_SHELL = ["./", "./manifest.webmanifest", "./favicon.svg", "./apple-touch-icon.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

// 版本號改變時，會連同舊版快取（含 v5 以前可能存下的 Supabase 回應）一併清除。
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  // 只處理本站檔案；Supabase 的 API 與登入請求一律交給網路，
  // 避免把使用者的學習紀錄或登入資料寫進快取，登出或換帳號後被離線讀到。
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // 只快取成功的完整回應，不快取 404/500 或 206 片段。
        if (response.ok && response.status === 200 && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        // 只有頁面導覽才退回首頁外殼；其他資源缺失就維持失敗，避免把 HTML 當成 JS 回傳。
        if (request.mode === "navigate") {
          const shell = await caches.match("./");
          if (shell) return shell;
        }
        return Response.error();
      })
  );
});
