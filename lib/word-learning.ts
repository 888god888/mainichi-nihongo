import type { Word } from '../data/lessons';
import { shuffleItems } from './grammar-learning';
export type WordQuizKind = 'audio' | 'spelling' | 'reading';
export type KanaTile = { id: number; text: string };
export function normalizeKana(reading: string): string {
  return reading.normalize('NFKC').replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60)).replace(/\s/g, '');
}
export function wordQuestionKind(correctCount: number, random = Math.random): WordQuizKind {
  if (correctCount === 0) return 'audio';
  return random() < 0.65 ? 'spelling' : 'reading';
}
export function wordOptions(words: Word[], index: number, random = Math.random): number[] {
  const target = words[index];
  const usedReadings = new Set([normalizeKana(target.reading)]);
  const usedMeanings = new Set([target.meaning]);
  const other = shuffleItems(words.map((_, i) => i).filter(i => i !== index), random).filter(i => {
    const reading = normalizeKana(words[i].reading);
    if (usedReadings.has(reading) || usedMeanings.has(words[i].meaning)) return false;
    usedReadings.add(reading); usedMeanings.add(words[i].meaning); return true;
  }).slice(0, 3);
  return shuffleItems([index, ...other], random);
}
export function kanaTiles(reading: string, random = Math.random): KanaTile[] {
  const letters = Array.from(normalizeKana(reading));
  const pool = shuffleItems(Array.from('あいうえおかきくけこさしすせそたちつてとなにぬねのまみむめもやゆよらりるれろんっー').filter(c => !letters.includes(c)), random).slice(0, 2);
  return shuffleItems([...letters, ...pool].map((text, id) => ({ id, text })), random);
}
export function wordScore(previous: number, correct: boolean, usedHint: boolean): { count: number; complete: boolean } {
  if (!correct) return { count: 0, complete: false };
  if (usedHint) return { count: previous, complete: false };
  const count = previous + 1;
  return { count, complete: count >= 2 };
}
export function insertWordLater(queue: number[], index: number, random = Math.random): number[] {
  const result = [...queue];
  const earliest = Math.min(2, result.length);
  const position = earliest + Math.floor(random() * (result.length - earliest + 1));
  result.splice(position, 0, index); return result;
}
