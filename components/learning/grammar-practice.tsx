"use client";

import { useEffect, useRef, useState } from 'react';
import { Brain, Check, Eye, Lightbulb, RotateCcw, Volume2 } from 'lucide-react';
import type { Grammar } from '@/data/lessons';
import { n5Lessons } from '@/data/lessons';
import { grammarLabel, grammarPractice, questionsForGrammar, type GrammarQuestion } from '@/data/grammar-practice';
import { dueGrammarTitles, recordGrammarResult, retryWithAlternate, shuffleItems, type GrammarReviewBook } from '@/lib/grammar-learning';

type Props = {
  grammar: Grammar[]; completed: number[]; userId: string; date: string;
  onComplete: (index: number) => Promise<boolean>; onActiveChange: (active: boolean) => void;
};
const allGrammar = n5Lessons.flatMap(lesson => lesson.grammar);

export function GrammarPractice({ grammar, completed, userId, date, onComplete, onActiveChange }: Props) {
  const [book, setBook] = useState<GrammarReviewBook>({});
  const [storageReady, setStorageReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [queue, setQueue] = useState<GrammarQuestion[]>([]);
  const [options, setOptions] = useState<GrammarQuestion['options']>([]);
  const [active, setActive] = useState(false);
  const [mode, setMode] = useState<'daily' | 'review' | 'practice'>('daily');
  const [choice, setChoice] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [hint, setHint] = useState(false);
  const [summary, setSummary] = useState<{ right: number; wrong: number; count: number } | null>(null);
  const [stats, setStats] = useState({ right: 0, wrong: 0, count: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [recallOpen, setRecallOpen] = useState(false);
  const [recallAnswer, setRecallAnswer] = useState(false);
  const answering = useRef(false);
  const storageKey = `mainichi:grammar-review:v1:${userId}`;
  const question = queue[0];
  const correct = Boolean(question && choice === question.answer);
  const currentTitle = question ? grammarPractice.find(item => `${item.title}:${question.variant}` === question.id)?.title : undefined;
  const currentGrammar = allGrammar.find(item => item.title === currentTitle);
  const due = dueGrammarTitles(book, date, allGrammar.map(item => item.title));
  const dailyDone = completed.length === grammar.length;

  useEffect(() => {
    try {
      const raw: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
      const safe: GrammarReviewBook = {};
      if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        for (const [key, value] of Object.entries(raw)) {
          const entry = value as GrammarReviewBook[string];
          if (entry && Number.isInteger(entry.stage) && entry.stage >= 0 && entry.stage <= 4 &&
            /^\d{4}-\d{2}-\d{2}$/.test(entry.due) && Number.isFinite(entry.wrong) &&
            typeof entry.lastDate === 'string' && (entry.lastVariant === 0 || entry.lastVariant === 1)) safe[key] = entry;
        }
      }
      setBook(safe);
    } catch { setStorageAvailable(false); }
    setStorageReady(true);
  }, [storageKey]);

  function updateBook(title: string, isCorrect: boolean, variant: number) {
    const next = { ...book, [title]: recordGrammarResult(book[title], isCorrect, date, variant) };
    setBook(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); }
    catch { setStorageAvailable(false); }
  }

  function showQuestion(nextQueue: GrammarQuestion[]) {
    setQueue(nextQueue);
    setOptions(nextQueue.length ? shuffleItems(nextQueue[0].options) : []);
    setChoice(null); setHint(false); setRevealed(false); setError('');
    answering.current = false;
  }

  function start(nextMode: typeof mode) {
    const entries = nextMode === 'review'
      ? due.slice(0, 3).map(title => ({ item: allGrammar.find(g => g.title === title)!, index: -1 }))
      : grammar.map((item, index) => ({ item, index })).filter(({ index }) => nextMode === 'practice' || !completed.includes(index));
    const questions = shuffleItems(entries).map(({ item, index }) => {
      const variants = questionsForGrammar(index, item.title);
      const previous = book[item.title];
      return variants[previous ? 1 - previous.lastVariant : Math.floor(Math.random() * variants.length)];
    });
    if (!questions.length) return;
    setMode(nextMode); setSummary(null); setStats({ right: 0, wrong: 0, count: questions.length });
    setRecallOpen(false); showQuestion(questions); setActive(true); onActiveChange(true);
  }

  function answer(text: string) {
    if (!question || choice !== null || answering.current) return;
    answering.current = true;
    setChoice(text);
    // 錯題當下記錄，稍後離開仍保留本裝置的到期複習。
    if (text !== question.answer && currentTitle) updateBook(currentTitle, false, question.variant);
  }

  async function advance() {
    if (!question || choice === null || saving || !currentTitle) return;
    setSaving(true); setError('');
    try {
      if (correct && !hint && mode === 'daily' && !completed.includes(question.grammarIndex)) {
        if (!await onComplete(question.grammarIndex)) { setError('進度尚未同步，請按繼續重試；你的答案仍保留。'); return; }
      }
      const passed = correct && !hint;
      const nextStats = { ...stats, right: stats.right + (passed ? 1 : 0), wrong: stats.wrong + (correct ? 0 : 1) };
      setStats(nextStats);
      let remaining = queue.slice(1);
      if (passed) updateBook(currentTitle, true, question.variant);
      else {
        const alternate = questionsForGrammar(question.grammarIndex, currentTitle)[1 - question.variant];
        remaining = retryWithAlternate(queue, alternate);
      }
      showQuestion(remaining);
      if (!remaining.length) { setActive(false); onActiveChange(false); setSummary(nextStats); }
    } catch { setError('暫時無法同步，請稍後再按繼續。'); }
    finally { setSaving(false); }
  }

  function pause() {
    if (saving) return;
    setActive(false); onActiveChange(false); setSummary(null);
  }

  function playCompletedSentence() {
    if (!question || choice === null || !('speechSynthesis' in window)) return;
    const text = question.sentence.replace('［　］', question.answer).replace(/([\p{Script=Han}々]+)（([^）]+)）/gu, '$2');
    // 假名讀音與詞形固定；不讓合成語音自行猜漢字。
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP'; utterance.rate = 0.82;
    const voice = window.speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith('ja'));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }

  if (!active || !question) return (
    <div className="grammar-learning-home">
      <div className="study-method"><Brain size={22} /><div><strong>先想一句，再選答案</strong><span>每天 3 題新情境；答錯會換句重測，通過後才完成。</span></div></div>
      {summary && <div className="grammar-summary" role="status"><Check size={22} /><div><strong>{mode === 'review' ? '這輪複習完成' : mode === 'practice' ? '加強練習完成' : '今天的文法練習完成'}</strong><p>完成 {summary.count} 個文法{summary.wrong > 0 ? `，${summary.wrong} 次錯誤都已重新練習` : '，全部獨立答對'}。</p></div></div>}
      <button className="quiz-launch grammar-quiz-launch" disabled={!storageReady} onClick={() => start(dailyDone ? 'practice' : 'daily')}>
        {dailyDone ? <><RotateCcw size={18} />再練不同情境</> : <><Brain size={18} />{completed.length ? '繼續文法練習' : '開始 3 題情境練習'}</>}
      </button>
      <div className="grammar-review-box">
        <div><strong>間隔複習</strong><p>{due.length ? `${due.length} 個文法到期；每輪最多 3 題。` : '答對後，安排 1、3、7、14、30 天後再練。'}</p></div>
        <button onClick={() => start('review')} disabled={!storageReady || !due.length}>複習{due.length ? ` ${Math.min(due.length, 3)} 題` : '未到期'}</button>
      </div>
      <p className="grammar-device-note">今日完成進度同步雲端。複習排程{storageAvailable ? '保存在目前裝置與瀏覽器，依登入帳號分開。' : '目前無法儲存在此瀏覽器，關閉後不會保留。'}</p>
      {dailyDone && <div className="grammar-recall"><button onClick={() => { setRecallOpen(!recallOpen); setRecallAnswer(false); }}><Lightbulb size={17} />挑戰：自己說一句</button>{recallOpen && <><p>先試著用今天第 1 個文法，說出「{grammar[0].translation}」。這是自我練習，不影響完成紀錄。</p><button onClick={() => setRecallAnswer(!recallAnswer)}>{recallAnswer ? '遮住參考句' : '我說完了，看參考句'}</button>{recallAnswer && <p lang="ja">{grammar[0].example}</p>}</>}</div>}
    </div>
  );

  return (
    <section className="quiz-panel grammar-quiz-panel" aria-label="文法情境練習">
      <div className="quiz-topline"><div><span>USE IT IN CONTEXT</span><strong>{mode === 'review' ? '到期複習' : mode === 'practice' ? '換個情境練' : '文法情境練習'}</strong></div><button onClick={pause} disabled={saving}>暫停練習</button></div>
      <div className="quiz-meta"><span>尚有 {queue.length} 題</span><span>{mode === 'daily' ? `今日通過 ${completed.length} / ${grammar.length}` : '答錯換句再練'}</span></div>
      <div className="grammar-scene"><span className="grammar-scene-label">你會怎麼說？</span><p>{question.context}</p></div>
      <div className="grammar-sentence" lang="ja">{question.sentence.split('［　］')[0]}<span className="grammar-blank">{choice !== null ? question.answer : '？'}</span>{question.sentence.split('［　］')[1]}</div>
      {!revealed && <div className="grammar-think"><p>先在心中補出空格，再看選項確認。</p><button onClick={() => setRevealed(true)}><Eye size={18} />我想好了，顯示選項</button></div>}
      {revealed && <div className="quiz-options grammar-context-options">{options.map(option => <button lang="ja" key={option.text} disabled={choice !== null} onClick={() => answer(option.text)} className={choice !== null && option.text === question.answer ? 'correct' : choice === option.text ? 'wrong' : ''}>{option.text}</button>)}</div>}
      {choice === null && <div className="grammar-hint"><button onClick={() => setHint(true)} disabled={hint}><Lightbulb size={16} />需要提示</button>{hint && <p>{currentGrammar?.meaning}。{question.explanation} 看提示後會換句再練，不直接計為通過。</p>}</div>}
      {choice !== null && <div className={`grammar-explanation ${correct ? 'correct' : 'wrong'}`} role="status">
        <strong>{correct ? hint ? '選對了，接著換句獨立練一次' : '答對了，你用對了！' : '這裡容易混淆，換個情境再練'}</strong>
        {!correct && <p className="grammar-choice-reason">你選「{choice}」：{options.find(o => o.text === choice)?.reason}</p>}
        <p>{question.explanation}</p>
        <div className="grammar-answer-line"><span>{grammarLabel(currentGrammar?.title ?? '')}</span><button onClick={playCompletedSentence} aria-label="播放完整答案"><Volume2 size={18} />聽完整句</button></div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="grammar-next" onClick={() => void advance()} disabled={saving}>{saving ? '同步中…' : correct && !hint ? queue.length === 1 ? '完成這輪練習' : '繼續' : '了解，換句再練'}</button>
      </div>}
    </section>
  );
}
