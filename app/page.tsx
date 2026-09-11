"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  BookOpenText,
  Brain,
  Check,
  Cloud,
  Flame,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Play,
  RotateCcw,
  Sparkles,
  UserRound,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

type QuizKind = "reading" | "audio";
type QuizFeedback = "correct" | "wrong" | null;
type GrammarQuizKind = "meaning" | "translation" | "pattern";

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
  const utterance = new SpeechSynthesisUtterance(text);
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

function shuffle(values: number[]) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function insertLater(values: number[], value: number) {
  const result = [...values];
  const earliest = Math.min(2, result.length);
  const position = earliest + Math.floor(Math.random() * (result.length - earliest + 1));
  result.splice(position, 0, value);
  return result;
}

function questionKind(wordIndex: number, correctCount: number): QuizKind {
  // 每個單字第一次一定考聽力；第二次多數仍為聽力，其餘考平假名辨認。
  if (correctCount === 0) return "audio";
  return wordIndex % 3 === 0 ? "reading" : "audio";
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
  const [learningDays, setLearningDays] = useState(0);
  const [quizActive, setQuizActive] = useState(false);
  const [quizQueue, setQuizQueue] = useState<number[]>([]);
  const [quizCorrectCounts, setQuizCorrectCounts] = useState<Record<number, number>>({});
  const [quizFeedback, setQuizFeedback] = useState<QuizFeedback>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [questionSequence, setQuestionSequence] = useState(0);
  const [grammarQuizActive, setGrammarQuizActive] = useState(false);
  const [grammarQuizQueue, setGrammarQuizQueue] = useState<number[]>([]);
  const [grammarQuizFeedback, setGrammarQuizFeedback] = useState<QuizFeedback>(null);
  const [grammarSelectedAnswer, setGrammarSelectedAnswer] = useState<number | null>(null);
  const [grammarQuestionSequence, setGrammarQuestionSequence] = useState(0);
  const hasTodayProgressRef = useRef(false);
  const todayCompletedRef = useRef(false);

  const date = localDateKey(today);
  const lessonIndex = dayOfYear(today) % n5Lessons.length;
  const lesson = n5Lessons[lessonIndex];
  const completeCount = checkedWords.length + checkedGrammar.length;
  const wordsDone = checkedWords.length === lesson.words.length;
  const lessonDone = wordsDone && checkedGrammar.length === lesson.grammar.length;
  const currentWordIndex = quizQueue[0] ?? null;
  const currentCorrectCount = currentWordIndex === null ? 0 : (quizCorrectCounts[currentWordIndex] ?? 0);
  const currentQuizKind = currentWordIndex === null ? "audio" : questionKind(currentWordIndex, currentCorrectCount);
  const quizOptions = useMemo(() => {
    if (currentWordIndex === null) return [];
    const distractors = shuffle(
      lesson.words.map((_, index) => index).filter((index) =>
        index !== currentWordIndex &&
        lesson.words[index].reading !== lesson.words[currentWordIndex].reading &&
        lesson.words[index].meaning !== lesson.words[currentWordIndex].meaning
      ),
    ).slice(0, 3);
    return shuffle([currentWordIndex, ...distractors]);
  }, [currentWordIndex, lesson.words, lessonIndex, questionSequence]);
  const currentGrammarIndex = grammarQuizQueue[0] ?? null;
  const currentGrammarQuizKind: GrammarQuizKind = ["meaning", "translation", "pattern"][grammarQuestionSequence % 3] as GrammarQuizKind;
  const grammarQuizOptions = useMemo(() => currentGrammarIndex === null ? [] : shuffle(lesson.grammar.map((_, index) => index)), [currentGrammarIndex, grammarQuestionSequence, lesson.grammar]);

  const loadLearningData = useCallback(async (activeUser: User) => {
    setDataLoading(true);
    const [{ data: profile }, { data: progress }, { data: historyRows }] = await Promise.all([
      supabase.from("profiles").select("username").eq("id", activeUser.id).single(),
      supabase
        .from("daily_progress")
        .select("completed_words, completed_grammar, completed")
        .eq("user_id", activeUser.id)
        .eq("lesson_date", date)
        .maybeSingle<ProgressRow>(),
      supabase
        .from("daily_progress")
        .select("lesson_date, completed")
        .eq("user_id", activeUser.id)
        .order("lesson_date", { ascending: false })
        .limit(366),
    ]);

    setUsername(profile?.username ?? activeUser.user_metadata?.username ?? "學習者");
    setCheckedWords(progress?.completed_words ?? []);
    setCheckedGrammar(progress?.completed_grammar ?? []);
    setQuizActive(false);
    setQuizQueue([]);
    setQuizCorrectCounts({});
    setQuizFeedback(null);
    setSelectedAnswer(null);
    setGrammarQuizActive(false);
    setGrammarQuizQueue([]);
    setGrammarQuizFeedback(null);
    setGrammarSelectedAnswer(null);
    hasTodayProgressRef.current = Boolean(progress);
    todayCompletedRef.current = Boolean(progress?.completed);
    setLearningDays((historyRows ?? []).length);
    setStreak(calculateStreak((historyRows ?? []).filter((row) => row.completed).map((row) => row.lesson_date), today));
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
        setQuizActive(false);
        setQuizQueue([]);
        setQuizCorrectCounts({});
        setQuizFeedback(null);
        setSelectedAnswer(null);
        setGrammarQuizActive(false);
        setGrammarQuizQueue([]);
        setGrammarQuizFeedback(null);
        setGrammarSelectedAnswer(null);
        setStreak(0);
        setLearningDays(0);
        hasTodayProgressRef.current = false;
        todayCompletedRef.current = false;
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
    if (!error && !hasTodayProgressRef.current) {
      hasTodayProgressRef.current = true;
      setLearningDays((current) => current + 1);
    }
    if (!error && completed && !todayCompletedRef.current) {
      todayCompletedRef.current = true;
      setStreak((current) => current + 1);
    }
    setSyncing(false);
  };

  const startQuiz = () => {
    const remaining = lesson.words
      .map((_, index) => index)
      .filter((index) => !checkedWords.includes(index));
    const nextQueue = shuffle(remaining);
    setQuizQueue(nextQueue);
    setQuizCorrectCounts({});
    setQuizFeedback(null);
    setSelectedAnswer(null);
    setQuestionSequence((current) => current + 1);
    setQuizActive(remaining.length > 0);
    if (nextQueue.length > 0) speak(lesson.words[nextQueue[0]].reading);
  };

  const answerQuiz = (answerIndex: number) => {
    if (currentWordIndex === null || quizFeedback) return;
    setSelectedAnswer(answerIndex);
    setQuizFeedback(answerIndex === currentWordIndex ? "correct" : "wrong");
  };

  const advanceQuiz = () => {
    if (currentWordIndex === null || !quizFeedback) return;

    let remainingQueue = quizQueue.slice(1);
    const nextCounts = { ...quizCorrectCounts };
    let nextCompleted = checkedWords;

    if (quizFeedback === "correct") {
      const nextCount = currentCorrectCount + 1;
      if (nextCount >= 2) {
        delete nextCounts[currentWordIndex];
        nextCompleted = [...checkedWords, currentWordIndex].sort((a, b) => a - b);
        setCheckedWords(nextCompleted);
        void saveProgress(nextCompleted, checkedGrammar);
      } else {
        nextCounts[currentWordIndex] = nextCount;
        remainingQueue = insertLater(remainingQueue, currentWordIndex);
      }
    } else {
      nextCounts[currentWordIndex] = 0;
      remainingQueue = insertLater(remainingQueue, currentWordIndex);
    }

    setQuizCorrectCounts(nextCounts);
    setQuizFeedback(null);
    setSelectedAnswer(null);
    setQuestionSequence((current) => current + 1);
    setQuizQueue(remainingQueue);
    if (remainingQueue.length === 0) setQuizActive(false);
    else {
      const nextWordIndex = remainingQueue[0];
      const nextCorrectCount = nextCounts[nextWordIndex] ?? 0;
      if (questionKind(nextWordIndex, nextCorrectCount) === "audio") {
        speak(lesson.words[nextWordIndex].reading);
      }
    }
  };

  const startGrammarQuiz = () => {
    if (!wordsDone) return;
    const remaining = lesson.grammar.map((_, index) => index).filter((index) => !checkedGrammar.includes(index));
    setGrammarQuizQueue(shuffle(remaining));
    setGrammarQuizFeedback(null);
    setGrammarSelectedAnswer(null);
    setGrammarQuestionSequence((current) => current + 1);
    setGrammarQuizActive(remaining.length > 0);
  };

  const answerGrammarQuiz = (answerIndex: number) => {
    if (currentGrammarIndex === null || grammarQuizFeedback) return;
    setGrammarSelectedAnswer(answerIndex);
    setGrammarQuizFeedback(answerIndex === currentGrammarIndex ? "correct" : "wrong");
  };

  const advanceGrammarQuiz = () => {
    if (currentGrammarIndex === null || !grammarQuizFeedback) return;
    const remainingQueue = grammarQuizQueue.slice(1);
    if (grammarQuizFeedback === "correct") {
      const next = [...checkedGrammar, currentGrammarIndex].sort((a, b) => a - b);
      setCheckedGrammar(next);
      void saveProgress(checkedWords, next);
    }
    setGrammarQuizQueue(remainingQueue);
    setGrammarQuizFeedback(null);
    setGrammarSelectedAnswer(null);
    setGrammarQuestionSequence((current) => current + 1);
    if (remainingQueue.length === 0) setGrammarQuizActive(false);
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
          <p>{lessonDone ? "今日（きょう）の任務（にんむ）、完成（かんせい）！" : wordsDone ? "單字測驗通過，進入文法練習吧。" : "先學習 10 個單字，通過測驗後再完成 3 個文法。"}</p>
          <div className="progress-stats"><span><BookOpenText size={15} />累計學習 {learningDays} 天</span><span><Flame size={16} />連續完成 {streak} 天</span></div>
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
            <div className="study-method">
              <Brain size={22} />
              <div><strong>看完後用聽力測驗確認</strong><span>約八成是聽力題，作答前不顯示漢字；每個單字要答對兩次。</span></div>
            </div>

            {!quizActive ? (
              <>
                <div className="word-grid">
                  {lesson.words.map((word, index) => {
                    const done = checkedWords.includes(index);
                    return (
                      <article className={`word-card ${done ? "done" : ""}`} key={`${word.japanese}-${index}`}>
                        <span className={`word-status ${done ? "passed" : ""}`}>{done ? <><Check size={13} />已通過</> : "待測驗"}</span>
                        <div className="word-body">
                          <span className="reading">{word.reading}</span><strong>{word.japanese}</strong><span className="meaning">{word.meaning}</span>
                          {word.reference && <a href={word.reference.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.875rem" }}>核對來源</a>}
                        </div>
                        <Button variant="ghost" size="icon" className="speak-button" onClick={() => speak(word.reading)} aria-label={`播放 ${word.japanese} 的發音`}><Volume2 size={20} /></Button>
                      </article>
                    );
                  })}
                </div>
                <button className="quiz-launch" onClick={startQuiz} disabled={wordsDone}>
                  {wordsDone ? <><Check size={19} />10 個單字全部通過</> : <><Play size={19} fill="currentColor" />{checkedWords.length > 0 ? "繼續單字測驗" : "開始單字測驗"}</>}
                </button>
              </>
            ) : currentWordIndex !== null ? (
              <section className="quiz-panel" aria-live="polite">
                <div className="quiz-topline">
                  <div><span>ACTIVE RECALL</span><strong>記憶測驗</strong></div>
                  <button onClick={() => setQuizActive(false)}>返回單字表</button>
                </div>
                <div className="quiz-meta">
                  <span>已通過 {checkedWords.length} / 10</span>
                  <span>這個單字第 {currentCorrectCount + 1} / 2 次</span>
                </div>

                <div className="quiz-prompt">
                  {currentQuizKind === "audio" && <><p>聽發音，選出正確的中文意思</p><span>{lesson.words[currentWordIndex].reading}</span><button className="quiz-audio" onClick={() => speak(lesson.words[currentWordIndex].reading)}><Volume2 size={26} />重新播放</button></>}
                  {currentQuizKind === "reading" && <><p>選出正確的平假名讀音</p><strong>{lesson.words[currentWordIndex].meaning}</strong></>}
                </div>

                <div className="quiz-options">
                  {quizOptions.map((optionIndex) => {
                    const option = lesson.words[optionIndex];
                    const isCorrect = optionIndex === currentWordIndex;
                    const isSelected = optionIndex === selectedAnswer;
                    const resultClass = quizFeedback && isCorrect ? "correct" : quizFeedback === "wrong" && isSelected ? "wrong" : "";
                    return (
                      <button key={optionIndex} className={resultClass} onClick={() => answerQuiz(optionIndex)} disabled={Boolean(quizFeedback)}>
                        {currentQuizKind === "reading" ? <strong>{option.reading}</strong> : option.meaning}
                      </button>
                    );
                  })}
                </div>

                {quizFeedback && (
                  <div className={`quiz-feedback ${quizFeedback}`}>
                    <div>{quizFeedback === "correct" ? <Check /> : <RotateCcw />}</div>
                    <p><strong>{quizFeedback === "correct" ? "答對了！" : "還沒記住，稍後再考一次"}</strong><span>{lesson.words[currentWordIndex].japanese}（{lesson.words[currentWordIndex].reading}）＝ {lesson.words[currentWordIndex].meaning}</span></p>
                    <button onClick={advanceQuiz}>繼續</button>
                  </div>
                )}
              </section>
            ) : null}
          </section>

          <section className={`lesson-section grammar-section ${!wordsDone ? "locked" : ""}`}>
            <div className="section-heading">
              <div className="section-number">二</div>
              <div><p>GRAMMAR</p><h2>今日（きょう）の文法（ぶんぽう）</h2></div>
              <span>{checkedGrammar.length} / 3</span>
            </div>
            {!wordsDone && <div className="grammar-lock"><LockKeyhole size={24} /><p><strong>先通過 10 個單字測驗</strong><span>每個單字答對兩次後，今天的 3 個文法會在這裡開啟。</span></p></div>}
            <div className="grammar-list" aria-hidden={!wordsDone}>
              {lesson.grammar.map((item, index) => {
                const done = checkedGrammar.includes(index);
                return (
                  <article className={`grammar-card ${done ? "done" : ""}`} key={item.title}>
                    <div className="grammar-topline"><span className="grammar-index">0{index + 1}</span><div><h3>{item.title}</h3><p>{item.meaning}</p></div><span className={`grammar-status ${done ? "passed" : ""}`}>{done ? "已通過" : "待測驗"}</span></div>
                    <div className="pattern"><span>句型</span>{item.pattern}</div>
                    <div className="example-box"><div><strong>{item.example}</strong><span>{item.reading}</span><p>{item.translation}</p></div><Button variant="ghost" size="icon" onClick={() => speak(item.reading.split(/\s+/).map((part) => part === "は" ? "わ" : part === "へ" ? "え" : part === "を" ? "お" : part).join(""))} aria-label="播放例句發音"><Volume2 size={20} /></Button></div>
                  </article>
                );
              })}
            </div>
            {wordsDone && !grammarQuizActive && <button className="quiz-launch grammar-quiz-launch" onClick={startGrammarQuiz} disabled={checkedGrammar.length === lesson.grammar.length}>{checkedGrammar.length === lesson.grammar.length ? <><Check size={19} />3 題文法全部通過</> : <><Brain size={19} />{checkedGrammar.length > 0 ? "重考未通過的文法" : "開始 3 題文法測驗"}</>}</button>}
            {wordsDone && grammarQuizActive && currentGrammarIndex !== null && (
              <section className="quiz-panel grammar-quiz-panel" aria-live="polite">
                <div className="quiz-topline"><div><span>GRAMMAR QUIZ</span><strong>文法小測驗</strong></div><button onClick={() => setGrammarQuizActive(false)}>稍後再考</button></div>
                <div className="quiz-meta"><span>這輪剩餘 {grammarQuizQueue.length} 題</span><span>已通過 {checkedGrammar.length} / 3</span></div>
                <div className="quiz-prompt grammar-quiz-prompt">
                  {currentGrammarQuizKind === "meaning" && <><p>哪個文法符合下面的意思？</p><strong>{lesson.grammar[currentGrammarIndex].meaning}</strong></>}
                  {currentGrammarQuizKind === "translation" && <><p>選出這個例句的正確中文意思</p><strong>{lesson.grammar[currentGrammarIndex].example}</strong><span>{lesson.grammar[currentGrammarIndex].reading}</span></>}
                  {currentGrammarQuizKind === "pattern" && <><p>選出正確的句型結構</p><strong>{lesson.grammar[currentGrammarIndex].title}</strong><span>{lesson.grammar[currentGrammarIndex].meaning}</span></>}
                </div>
                <div className="quiz-options">
                  {grammarQuizOptions.map((optionIndex) => {
                    const option = lesson.grammar[optionIndex];
                    const isCorrect = optionIndex === currentGrammarIndex;
                    const isSelected = optionIndex === grammarSelectedAnswer;
                    const resultClass = grammarQuizFeedback && isCorrect ? "correct" : grammarQuizFeedback === "wrong" && isSelected ? "wrong" : "";
                    return <button key={optionIndex} className={resultClass} onClick={() => answerGrammarQuiz(optionIndex)} disabled={Boolean(grammarQuizFeedback)}>{currentGrammarQuizKind === "meaning" ? option.title : currentGrammarQuizKind === "translation" ? option.translation : option.pattern}</button>;
                  })}
                </div>
                {grammarQuizFeedback && <div className={`quiz-feedback ${grammarQuizFeedback}`}><div>{grammarQuizFeedback === "correct" ? <Check /> : <RotateCcw />}</div><p><strong>{grammarQuizFeedback === "correct" ? "答對了！" : "這題還沒通過，稍後可以重考"}</strong><span>{lesson.grammar[currentGrammarIndex].title}：{lesson.grammar[currentGrammarIndex].meaning}</span></p><button onClick={advanceGrammarQuiz}>下一題</button></div>}
              </section>
            )}
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
