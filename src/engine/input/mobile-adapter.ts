import type { InputEvent } from "./types";

export function diffMobileInput(previous: string, current: string, t: number): InputEvent[] {
  if (current.length < previous.length) return Array.from({ length: previous.length - current.length }, () => ({ char: "", t, kind: "backspace" as const }));
  return Array.from(current.slice(previous.length), (char) => ({ char, t, kind: char === " " ? "space" as const : char === "\n" ? "enter" as const : "char" as const }));
}
