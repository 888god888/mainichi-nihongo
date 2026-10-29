"use client";
import { useRef, useState } from 'react';
import { Check, Delete, Headphones, Lightbulb, Play, RotateCcw, Volume2 } from 'lucide-react';
import type { Word } from '@/data/lessons';
import { shuffleItems } from '@/lib/grammar-learning';
import { insertWordLater, kanaTiles, normalizeKana, wordOptions, wordQuestionKind, wordScore, type KanaTile, type WordQuizKind } from '@/lib/word-learning';

type Props = { words: Word[]; completed: number[]; onComplete: (index: number) => Promise<boolean>; onActiveChange: (active: boolean) => void };
function speakReading(text: string, slow = false) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP'; utterance.rate = slow ? 0.58 : 0.82;
  const voice = window.speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith('ja'));
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export function WordPractice({ words, completed, onComplete, onActiveChange }: Props) {
  const [active, setActive] = useState(false);
  const [queue, setQueue] = useState<number[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [kind, setKind] = useState<WordQuizKind>('audio');
  const [options, setOptions] = useState<number[]>([]);
  const [tiles, setTiles] = useState<KanaTile[]>([]);
  const [picked, setPicked] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hint, setHint] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [finished, setFinished] = useState(false);
  const [practice, setPractice] = useState(false);
  const answerLock = useRef(false);
  const [matchActive, setMatchActive] = useState(false);
  const [matchPool, setMatchPool] = useState<number[]>([]);
  const [leftOrder, setLeftOrder] = useState<number[]>([]);
  const [rightOrder, setRightOrder] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [matchSelected, setMatchSelected] = useState<number | null>(null);
  const [matchMessage, setMatchMessage] = useState('');
  const [matchWrong, setMatchWrong] = useState<number | null>(null);
  const index = queue[0];
  const word = index !== undefined ? words[index] : undefined;
  const count = counts[index] ?? 0;
  const assembled = picked.map(id => tiles.find(tile => tile.id === id)?.text ?? '').join('');
  const allDone = completed.length === words.length;

  function nextQuestion(nextQueue: number[], nextCounts: Record<number,number>) {
    setQueue(nextQueue); setCounts(nextCounts); setSelected(null); setFeedback(null); setHint(false); setPicked([]); setError(''); answerLock.current = false;
    if (!nextQueue.length) { setActive(false); onActiveChange(false); setFinished(true); return; }
    const next = nextQueue[0]; const nextKind = wordQuestionKind(nextCounts[next] ?? 0);
    setKind(nextKind); setOptions(wordOptions(words, next)); setTiles(kanaTiles(words[next].reading));
    if (nextKind !== 'reading') speakReading(words[next].reading);
  }
  function start() {
    const extra = allDone;
    const remaining = shuffleItems(words.map((_, i) => i).filter(i => extra || !completed.includes(i)));
    setPractice(extra); setFinished(false); setMatchActive(false); setActive(true); onActiveChange(true); nextQuestion(remaining, {});
  }
  function answer(correct: boolean, option: number | null = null) {
    if (feedback || answerLock.current) return;
    answerLock.current = true; setSelected(option); setFeedback(correct ? 'correct' : 'wrong');
  }
  async function advance() {
    if (!word || !feedback || saving) return;
    setSaving(true); setError('');
    try {
      const score = wordScore(count, feedback === 'correct', hint);
      if (score.complete && !practice && !completed.includes(index)) {
        if (!await onComplete(index)) { setError('進度還沒同步，請按繼續重試；答案會保留。'); return; }
      }
      const remaining = queue.slice(1); const nextCounts = {...counts};
      if (score.complete) delete nextCounts[index];
      else nextCounts[index] = score.count;
      nextQuestion(score.complete ? remaining : insertWordLater(remaining, index), nextCounts);
    } catch { setError('暫時無法同步，請稍後再試。'); }
    finally { setSaving(false); }
  }
  function pause() { if (!saving) { setActive(false); setMatchActive(false); onActiveChange(false); } }
  function startMatch() {
    // 相同讀音或相同中文不會同時進入配對，避免多個有效答案。
    const readings = new Set<string>(); const meanings = new Set<string>();
    const pool = shuffleItems(words.map((_,i) => i)).filter(i => {
      const reading = normalizeKana(words[i].reading);
      if (readings.has(reading) || meanings.has(words[i].meaning)) return false;
      readings.add(reading); meanings.add(words[i].meaning); return true;
    }).slice(0,5);
    setMatchPool(pool); setLeftOrder(shuffleItems(pool)); setRightOrder(shuffleItems(pool)); setMatched([]); setMatchSelected(null); setMatchWrong(null); setMatchMessage('先選左邊的讀音，再選右邊的中文。');
    setMatchActive(true); setActive(false); onActiveChange(true);
  }
  function match(right: number) {
    if (matchSelected === null || matched.includes(right)) return;
    if (right === matchSelected) { setMatched(prev=>[...prev,right]); setMatchSelected(null); setMatchWrong(null); setMatchMessage('配對成功！'); }
    else { setMatchWrong(right); setMatchMessage('這組還不對，聽一次再選。'); speakReading(words[matchSelected].reading); }
  }

  if (matchActive) return <section className="quiz-panel word-match-panel" aria-label="單字配對練習">
    <div className="quiz-topline"><div><span>MIX & MATCH</span><strong>5 組單字配對</strong></div><button onClick={pause}>返回單字表</button></div>
    <div className="quiz-meta"><span>已配對 {matched.length} / {matchPool.length}</span><span>暖身練習，不影響測驗進度</span></div>
    <p className="word-match-message" role="status">{matched.length === matchPool.length ? '全部配對完成！可以換一輪或回去測驗。' : matchMessage}</p>
    <div className="word-match-grid"><div>{leftOrder.map(i=><button key={i} lang="ja" disabled={matched.includes(i)} className={matched.includes(i)?'matched':matchSelected===i?'selected':''} onClick={()=>{setMatchSelected(i);setMatchWrong(null);speakReading(words[i].reading);}}>{words[i].reading}{matched.includes(i)&&<Check size={16}/>}</button>)}</div><div>{rightOrder.map(i=><button key={i} disabled={matched.includes(i)||matchSelected===null} className={matched.includes(i)?'matched':matchWrong===i?'wrong':''} onClick={()=>match(i)}>{words[i].meaning}{matched.includes(i)&&<Check size={16}/>}</button>)}</div></div>
    {matched.length===matchPool.length&&<button className="grammar-next" onClick={startMatch}>再配一輪</button>}
  </section>;

  if (!active || !word) return <div className="word-learning-home">
    {finished&&<p className="word-round-complete" role="status"><Check size={20}/>這輪單字練習完成，每字都已通過兩次。</p>}
    <button className="quiz-launch" onClick={start}>{allDone?<><RotateCcw size={19}/>換題型再練一次</>:<><Play size={19}/>{completed.length?'繼續混合測驗':'開始單字混合測驗'}</>}</button>
    <button className="word-match-launch" onClick={startMatch}>先玩 5 組配對暖身</button>
  </div>;

  return <section className="quiz-panel word-variety-panel" aria-label="單字混合測驗">
    <div className="quiz-topline"><div><span>{kind==='spelling'?'LISTEN & BUILD':kind==='audio'?'LISTEN & RECOGNIZE':'RECALL THE READING'}</span><strong>{kind==='spelling'?'聽音拼假名':kind==='audio'?'聽音選意思':'中文反查讀音'}</strong></div><button disabled={saving} onClick={pause}>暫停測驗</button></div>
    <div className="quiz-meta"><span>{practice?'加強練習':`今日通過 ${completed.length} / ${words.length}`}</span><span>這個字第 {count+1} / 2 次</span></div>
    <div className="quiz-prompt">
      {kind==='reading'?<><p>看到中文意思，你能想起讀音嗎？</p><strong>{word.meaning}</strong></>:<><p>{kind==='spelling'?'聽發音，點選假名拼出單字':'聽發音，選出中文意思'}</p>{kind==='audio'&&<span lang="ja">{word.reading}</span>}<div className="word-audio-actions"><button className="quiz-audio" onClick={()=>speakReading(word.reading)}><Volume2 size={24}/>重播</button><button onClick={()=>speakReading(word.reading,true)}><Headphones size={17}/>慢速</button></div></>}
    </div>
    {kind==='spelling'?<div className="word-spelling">
      <p className="word-spelling-note">這題先遮住假名，避免直接照抄。長音「ー」和小字「っ・ゃ・ゅ・ょ」也要拼入。</p>
      <div className="word-built-answer" aria-label="已拼出的假名" lang="ja">{assembled||'點下面的假名開始'}<button disabled={!picked.length||Boolean(feedback)} onClick={()=>setPicked(prev=>prev.slice(0,-1))} aria-label="刪除最後一字"><Delete size={20}/></button></div>
      <div className="kana-tile-bank">{tiles.map(tile=><button key={tile.id} lang="ja" disabled={picked.includes(tile.id)||Boolean(feedback)} onClick={()=>setPicked(prev=>[...prev,tile.id])} aria-label={`假名 ${tile.text}`}>{tile.text}</button>)}</div>
      {hint&&<p className="word-kana-hint" lang="ja">讀音：{word.reading}（本次不計通過）</p>}
      {!feedback&&<div className="word-spelling-controls"><button className="word-hint-button" onClick={()=>setHint(true)} disabled={hint}><Lightbulb size={16}/>看讀音提示</button><button className="word-confirm" disabled={!picked.length} onClick={()=>answer(normalizeKana(assembled)===normalizeKana(word.reading))}>確認拼讀</button></div>}
    </div>:<div className="quiz-options">{options.map(i=><button key={i} disabled={Boolean(feedback)} className={feedback&&i===index?'correct':feedback==='wrong'&&i===selected?'wrong':''} onClick={()=>answer(i===index,i)}>{kind==='reading'?<strong lang="ja">{words[i].reading}</strong>:words[i].meaning}</button>)}</div>}
    {feedback&&<div className={`grammar-explanation ${feedback}`} role="status"><strong>{feedback==='wrong'?'還不熟，稍後換個方式再練':hint?'答案正確，接著再獨立練一次':'答對了！'}</strong>{kind==='spelling'&&feedback==='wrong'&&<p>你拼的是「{assembled}」。注意小字、濁音及長音。</p>}<p lang="ja">{word.japanese}（{word.reading}）</p><p>{word.meaning}</p><button className="word-feedback-audio" onClick={()=>speakReading(word.reading)}><Volume2 size={17}/>再聽一次</button>{error&&<p className="auth-error" role="alert">{error}</p>}<button className="grammar-next" disabled={saving} onClick={()=>void advance()}>{saving?'同步中…':'繼續'}</button></div>}
  </section>;
}
