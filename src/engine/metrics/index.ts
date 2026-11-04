import type { InputEvent } from "../input/types";

export type RunMetrics = { correct: number; typed: number; errors: number; raw: number; wpm: number; accuracy: number; consistency: number; elapsed: number };
export type TypingRecord = { event: InputEvent; expected: string; correct: boolean };
export function calculateMetrics(records: TypingRecord[], elapsedMs: number): RunMetrics {
  const chars = records.filter(({ event }) => event.kind === "char" || event.kind === "space");
  const correct = chars.filter((record) => record.correct).length;
  const errors = chars.length - correct;
  const minutes = Math.max(elapsedMs / 60000, 1 / 60);
  const intervals = records.slice(1).map(({ event }, i) => Math.max(0, event.t - records[i].event.t)).filter((n) => n > 0);
  const mean = intervals.length ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
  const cv = mean ? Math.sqrt(intervals.reduce((a, n) => a + (n - mean) ** 2, 0) / intervals.length) / mean : 0;
  return { correct, typed: chars.length, errors, raw: Math.round(chars.length / 5 / minutes), wpm: Math.round(correct / 5 / minutes), accuracy: chars.length ? Math.round((correct / chars.length) * 100) : 100, consistency: Math.max(0, Math.round((1 - Math.min(cv, 1)) * 100)), elapsed: elapsedMs };
}
