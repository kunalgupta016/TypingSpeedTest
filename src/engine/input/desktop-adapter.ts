import type { InputEvent } from "./types";

export function adaptDesktopKey(event: KeyboardEvent, t: number): InputEvent | null {
  if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return null;
  if (event.key === "Escape") return { char: "", t, kind: "escape" };
  if (event.key === "Backspace") return { char: "", t, kind: "backspace" };
  if (event.key === "Enter") return { char: "", t, kind: "enter" };
  if (event.key === " ") return { char: " ", t, kind: "space" };
  return event.key.length === 1 ? { char: event.key, t, kind: "char" } : null;
}
