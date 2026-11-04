import type { InputEvent } from "@/engine/input/types";

export type SimulationState = { seed: number; tick: number; prompt: string; cursor: number; correct: number; errors: number; paused: boolean; ended: boolean; strict: boolean };
export function createSimulation(seed: number, prompt: string, strict = false): SimulationState { return { seed: seed >>> 0, tick: 0, prompt, cursor: 0, correct: 0, errors: 0, paused: false, ended: false, strict }; }
export function stepSimulation(state: SimulationState, ticks: number, events: readonly InputEvent[]): SimulationState {
  if (ticks < 0 || !Number.isInteger(ticks)) throw new RangeError("ticks must be a non-negative integer");
  let next = { ...state, tick: state.tick + ticks };
  for (const event of events) {
    if (event.kind === "escape") { next = { ...next, paused: !next.paused }; continue; }
    if (next.paused || next.ended) continue;
    if (event.kind === "backspace") { next = { ...next, cursor: Math.max(0, next.cursor - 1) }; continue; }
    if (event.kind !== "char" && event.kind !== "space") continue;
    const char = event.kind === "space" ? " " : event.char;
    const correct = char === next.prompt[next.cursor];
    const cursor = correct || !next.strict ? Math.min(next.prompt.length, next.cursor + 1) : next.cursor;
    next = { ...next, cursor, correct: next.correct + Number(correct), errors: next.errors + Number(!correct), ended: cursor >= next.prompt.length };
  }
  return next;
}
