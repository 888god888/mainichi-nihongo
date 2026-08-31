"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  BookOpenText,
  Check,
  Cloud,
  Flame,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Sparkles,
  UserRound,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { n5Lessons } from "@/data/lessons";
import { normalizeUsername, usernameToInternalEmail } from "@/lib/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type ProgressRow = {
  completed_words: number[];
  completed_grammar: number[];
  completed: boolean;
};

const pad = (value: number) => String(value).padStart(2, "0");

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
}

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.replace(/（[^）]+）/g, ""));
  utterance.lang = "ja-JP";
  utterance.rate = 0.82;
  const voice = window.speechSynthesis.getVoices().find((item) => item.lang.toLowerCase().startsWith("ja"));
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

function calculateStreak(completedDates: string[], today: Date) {
  const dates = new Set(completedDates);
  const cursor = new Date(today);
  if (!dates.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (dates.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function Home() {
  const [today] = useState(() => new Date());
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [accountInput, setAccountInput] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [checkedWords, setCheckedWords] = useState<number[]>([]);
  const [checkedGrammar, setCheckedGrammar] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);

  const date = localDateKey(today);
  const lessonIndex = dayOfYear(today) % n5Lessons.length;
  const lesson = n5Lessons[lessonIndex];
  const completeCount = checkedWords.length + checkedGrammar.length;
  const wordsDone = checkedWords.length === lesson.words.length;
  const lessonDone = wordsDone && checkedGrammar.length === lesson.grammar.length;

  const loadLearningData = useCallback(async (activeUser: User) => {
    setDataLoading(true);
    const [{ data: profile }, { data: progress }, { data: completedRows }] = await Promise.all([
      supabase.from("profiles").select("username").eq("id", activeUser.id).single(),
      supabase
        .from("daily_progress")
        .select("completed_words, completed_grammar, completed")
        .eq("user_id", activeUser.id)
        .eq("lesson_date", date)
        .maybeSingle<ProgressRow>(),
      supabase
        .from("daily_progress")
        .select("lesson_date")
        .eq("user_id", activeUser.id)
        .eq("completed", true)
        .order("lesson_date", { ascending: false })
        .limit(366),
    ]);

    setUsername(profile?.username ?? activeUser.user_metadata?.username ?? "學習者");
    setCheckedWords(progress?.completed_words ?? []);
    setCheckedGrammar(progress?.completed_grammar ?? []);
    setStreak(calculateStreak((completedRows ?? []).map((row) => row.lesson_date), today));
    setDataLoading(false);
  }, [date, today]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const activeUser = data.session?.user ?? null;
      setUser(activeUser);
      setAuthLoading(false);
      if (activeUser) void loadLearningData(activeUser);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      if (activeUser) void loadLearningData(activeUser);
      else {
        setUsername("");
        setCheckedWords([]);
        setCheckedGrammar([]);
        setStreak(0);
      }
    });

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").catch(() => undefined);
    }

    return () => listener.subscription.unsubscribe();
  }, [loadLearningData]);

  const saveProgress = async (words: number[], grammar: number[]) => {
    if (!user) return;
    setSyncing(true);
    const completed = words.length === lesson.words.length && grammar.length === lesson.grammar.length;
    const { error } = await supabase.from("daily_progress").upsert({
      user_id: user.id,
      lesson_date: date,
      lesson_number: lessonIndex + 1,
      completed_words: words,
      completed_grammar: grammar,
      completed,
      updated_at: new Date().toISOString(),
    });
    if (!error && completed) setStreak((current) => Math.max(1, current));
    setSyncing(false);
  };

  const toggleWord = (index: number) => {
    const next = checkedWords.includes(index)
      ? checkedWords.filter((item) => item !== index)
      : [...checkedWords, index].sort((a, b) => a - b);
    setCheckedWords(next);
    void saveProgress(next, checkedGrammar);
  };

  const toggleGrammar = (index: number) => {
    if (!wordsDone) return;
    const next = checkedGrammar.includes(index)
      ? checkedGrammar.filter((item) => item !== index)
      : [...checkedGrammar, index].sort((a, b) => a - b);
    setCheckedGrammar(next);
    void saveProgress(checkedWords, next);
  };

  const submitAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthMessage("");
    const account = accountInput.trim();
    const accountKey = normalizeUsername(account);

    if (!accountKey) {
      setAuthMessage("請輸入帳號。");
      return;
    }
    if (password.length < 6) {
      setAuthMessage("密碼至少需要 6 個字元。");
      return;
    }

    setAuthLoading(true);
    try {
      const email = await usernameToInternalEmail(account);

      if (mode === "register") {
        const { data: available, error: checkError } = await supabase.rpc("is_username_available", {
          p_username_key: accountKey,
        });
        if (checkError) throw new Error("資料庫尚未完成設定，請先執行 schema.sql。");
        if (!available) throw new Error("這個帳號已經有人使用。");

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: account, username_key: accountKey } },
        });
        if (error) throw error;
        if (!data.session) throw new Error("請先在 Supabase 關閉 Confirm email，才能使用純帳號註冊。");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error("帳號或密碼不正確。");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "操作失敗，請稍後再試。";
      setAuthMessage(message.includes("Database error saving new user") ? "帳號可能已存在，或資料庫設定尚未完成。" : message);
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setPassword("");
    setAccountInput("");
  };

  if (!isSupabaseConfigured) {
    return (
      <main className="center-screen">
        <div className="setup-card">
          <Cloud size={34} />
          <h1>尚未連接雲端</h1>
          <p>請設定 NEXT_PUBLIC_SUPABASE_URL 與 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY。</p>
        </div>
      </main>
    );
  }

  if (authLoading && !user) {
    return <main className="center-screen"><LoaderCircle className="spin" />正在確認登入狀態…</main>;
  }

  if (!user) {
    return (
      <main className="login-page">
        <div className="login-sun" aria-hidden="true" />
        <section className="login-intro">
          <span className="brand-mark">日</span>
          <p className="eyebrow">毎日（まいにち）15分（ふん）</p>
          <h1>每日日本語</h1>
          <p>每天認識 10 個單字、掌握 3 個文法，從 N5 慢慢走到 N1。</p>
          <div className="login-features">
            <span><Cloud size={17} />雲端同步進度</span>
            <span><Volume2 size={17} />日文發音</span>
            <span><Flame size={17} />連續學習紀錄</span>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-tabs" role="tablist" aria-label="登入或註冊">
            <button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setAuthMessage(""); }}>登入</button>
            <button className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setAuthMessage(""); }}>建立帳號</button>
          </div>
          <div className="auth-heading">
            <UserRound size={23} />
            <div>
              <h2>{mode === "login" ? "歡迎回來" : "開始每日學習"}</h2>
              <p>{mode === "login" ? "登入後繼續昨天的進度。" : "帳號不可重複，密碼至少 6 個字元。"}</p>
            </div>
          </div>
          <form onSubmit={submitAuth}>
            <label htmlFor="account">帳號</label>
            <Input id="account" value={accountInput} onChange={(event) => setAccountInput(event.target.value)} autoComplete="username" placeholder="輸入你的帳號" />
            <label htmlFor="password">密碼</label>
            <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="至少 6 個字元" />
            {authMessage && <p className="auth-error" role="alert">{authMessage}</p>}
            <Button type="submit" className="auth-submit" disabled={authLoading}>
              {authLoading ? <><LoaderCircle className="spin" />處理中…</> : mode === "login" ? "登入" : "建立帳號"}
            </Button>
          </form>
          <p className="auth-note">不需要 Email；密碼由 Supabase Auth 加密管理。</p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="sun-disc" aria-hidden="true" />
      <header className="topbar">
        <div>
          <p className="eyebrow">毎日（まいにち）15分（ふん）</p>
          <h1>今日（きょう）の日本語（にほんご）</h1>
          <p className="date-line">{today.toLocaleDateString("zh-TW", { month: "long", day: "numeric", weekday: "long" })}</p>
        </div>
        <div className="account-actions">
          <div className="user-chip"><UserRound size={15} /><span>{username || "學習者"}</span></div>
          <button onClick={signOut} aria-label="登出"><LogOut size={17} /></button>
        </div>
      </header>

      <section className="daily-progress" aria-label="今日學習進度">
        <div className="progress-copy">
          <div><span className="level-badge">JLPT N5</span><span className="lesson-label">第（だい）{lessonIndex + 1}課（か）</span></div>
          <div className="sync-state">{syncing ? <><LoaderCircle className="spin" />同步中</> : <><Cloud />已同步</>}<strong>{completeCount} / 13</strong></div>
        </div>
        <Progress value={(completeCount / 13) * 100} className="h-2.5 bg-[#e8dfd2] [&>div]:bg-[#d9544d]" />
        <div className="progress-bottom">
          <p>{lessonDone ? "今日（きょう）の任務（にんむ）、完成（かんせい）！" : wordsDone ? "單字完成，進入文法練習吧。" : "先認識 10 個單字，再完成 3 個文法。"}</p>
          <span><Flame size={16} />連續 {streak} 天</span>
        </div>
      </section>

      {dataLoading ? (
        <section className="data-loading"><LoaderCircle className="spin" />正在載入你的學習紀錄…</section>
      ) : (
        <>
          {lessonDone && (
            <section className="completion-card" aria-live="polite">
              <div className="completion-icon"><Sparkles /></div>
              <div><p>お疲（つか）れさまでした！</p><h2>今天的日文學習完成了</h2><span>明日（あした）再回來學下一份教材。</span></div>
            </section>
          )}

          <section className="lesson-section">
            <div className="section-heading">
              <div className="section-number">一</div>
              <div><p>VOCABULARY</p><h2>今日（きょう）の単語（たんご）</h2></div>
              <span>{checkedWords.length} / 10</span>
            </div>
            <div className="word-grid">
              {lesson.words.map((word, index) => {
                const done = checkedWords.includes(index);
                return (
                  <article className={`word-card ${done ? "done" : ""}`} key={`${word.japanese}-${index}`}>
                    <Checkbox checked={done} onCheckedChange={() => toggleWord(index)} aria-label={`${word.japanese} 已學會`} className="word-checkbox" />
                    <button className="word-body" onClick={() => toggleWord(index)}>
                      <span className="reading">{word.reading}</span><strong>{word.japanese}</strong><span className="meaning">{word.meaning}</span>
                    </button>
                    <Button variant="ghost" size="icon" className="speak-button" onClick={() => speak(word.japanese)} aria-label={`播放 ${word.japanese} 的發音`}><Volume2 size={20} /></Button>
                  </article>
                );
              })}
            </div>
          </section>

          <section className={`lesson-section grammar-section ${!wordsDone ? "locked" : ""}`}>
            <div className="section-heading">
              <div className="section-number">二</div>
              <div><p>GRAMMAR</p><h2>今日（きょう）の文法（ぶんぽう）</h2></div>
              <span>{checkedGrammar.length} / 3</span>
            </div>
            {!wordsDone && <div className="grammar-lock"><LockKeyhole size={24} /><p><strong>先完成 10 個單字</strong><span>完成後，今天的 3 個文法會在這裡開啟。</span></p></div>}
            <div className="grammar-list" aria-hidden={!wordsDone}>
              {lesson.grammar.map((item, index) => {
                const done = checkedGrammar.includes(index);
                return (
                  <article className={`grammar-card ${done ? "done" : ""}`} key={item.title}>
                    <div className="grammar-topline"><span className="grammar-index">0{index + 1}</span><div><h3>{item.title}</h3><p>{item.meaning}</p></div><Checkbox checked={done} onCheckedChange={() => toggleGrammar(index)} aria-label={`${item.title} 已學會`} className="grammar-checkbox" /></div>
                    <div className="pattern"><span>句型</span>{item.pattern}</div>
                    <div className="example-box"><div><strong>{item.example}</strong><span>{item.reading}</span><p>{item.translation}</p></div><Button variant="ghost" size="icon" onClick={() => speak(item.example)} aria-label="播放例句發音"><Volume2 size={20} /></Button></div>
                    <button className="grammar-done-button" onClick={() => toggleGrammar(index)} disabled={!wordsDone}>{done ? <><Check size={18} />已完成</> : "我理解了"}</button>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}

      <section className="level-roadmap">
        <div><p className="eyebrow">LEARNING PATH</p><h2>從 N5，慢慢走到 N1</h2><span>目前先打穩 N5 基礎，後續等級會依序加入。</span></div>
        <div className="level-track">
          {["N5", "N4", "N3", "N2", "N1"].map((level, index) => (
            <div className={`level-node ${index === 0 ? "active" : ""}`} key={level}><span>{index === 0 ? <Check size={18} /> : <LockKeyhole size={15} />}</span><strong>{level}</strong><small>{index === 0 ? "學習中" : "準備中"}</small></div>
          ))}
        </div>
      </section>

      <footer><BookOpenText size={15} />毎日（まいにち）少（すこ）しずつ、上手（じょうず）になる。</footer>
    </main>
  );
}

