"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { generatePrompt, type ContentTier } from "@/engine/content/generators";
import type { InputEvent } from "@/engine/input/types";
import { calculateMetrics, type RunMetrics, type TypingRecord } from "@/engine/metrics";
import { createSimulation, stepSimulation, type SimulationState } from "@/games/shared/game";
import { adaptDesktopKey } from "@/engine/input/desktop-adapter";
import { diffMobileInput } from "@/engine/input/mobile-adapter";
import { mulberry32 } from "@/engine/loop/rng";
import { getWeakKeyWeights, saveRun } from "@/lib/db";
import type { GameDefinition } from "@/games/registry";
import { englishWords } from "@/engine/content/word-lists/en";
import { defusePenalty, difficultyLabel, frequencyForLevel, mazeRouteLength, raceSpeed, startingLives, targetCapacity, type Difficulty } from "@/games/shared/difficulty";
import type { DailyChallenge } from "@/games/daily-challenge";

type Status = "ready" | "playing" | "paused" | "finished";
type FallingTarget = { id: number; word: string; lane: number; startAt: number; fallMs: number };
function makeSeed() { const bytes = new Uint32Array(1); crypto.getRandomValues(bytes); return bytes[0]; }
function makeFallingTarget(seed: number, id: number, startAt: number, weights: Record<string, number>, mechanic: "rain" | "blaster", difficulty: Difficulty, level: number): FallingTarget {
  const targetSeed = (seed + Math.imul(id + 1, 0x9e3779b9)) >>> 0;
  const random = mulberry32(targetSeed);
  const source = frequencyForLevel(level, difficulty) === "extended" ? [...englishWords.highFrequency, ...englishWords.mediumFrequency, ...englishWords.extended] : frequencyForLevel(level, difficulty) === "standard" ? [...englishWords.highFrequency, ...englishWords.mediumFrequency] : [...englishWords.highFrequency];
  const minimumLength = 3 + Math.min(4, level - 1) + (difficulty === "hard" ? 1 : 0);
  const candidates = source.filter((word) => word.length >= minimumLength);
  const choices = candidates.length ? candidates : source;
  const weighted = choices.map((word) => ({ word, weight: 1 + Math.min(3, Math.max(0, weights[word[0]] ?? 0)) }));
  const totalWeight = weighted.reduce((total, item) => total + item.weight, 0);
  let pick = random() * totalWeight;
  let word = weighted[0].word;
  for (const item of weighted) { pick -= item.weight; if (pick <= 0) { word = item.word; break; } }
  const baseFallMs = mechanic === "rain" ? 15000 : 11000;
  const difficultySpeed = difficulty === "easy" ? 0.78 : difficulty === "hard" ? 1.25 : 1;
  const levelSpeed = 1 + (level - 1) * 0.13;
  const fallMs = Math.max(3500, Math.floor(baseFallMs / (difficultySpeed * levelSpeed)) - Math.floor(id / 5) * 400);
  return { id, word, lane: 8 + random() * 84, startAt, fallMs };
}

type TypingSessionProps = { game: GameDefinition; dailyChallenge?: DailyChallenge; onRunSaved?: (run: import("@/lib/db").SavedRun) => void };

export function TypingSession({ game, dailyChallenge, onRunSaved }: TypingSessionProps) {
  const [seed, setSeed] = useState(0);
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [correctChars, setCorrectChars] = useState<boolean[]>([]);
  const [status, setStatus] = useState<Status>("ready");
  const [difficulty, setDifficulty] = useState<Difficulty>(dailyChallenge?.difficulty ?? "standard");
  const [level, setLevel] = useState(1);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [targetsCleared, setTargetsCleared] = useState(0);
  const [impact, setImpact] = useState<{ id: number; lane: number; top: number } | null>(null);
  const [duration, setDuration] = useState(game.duration);
  const [remaining, setRemaining] = useState(game.duration);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [raceProgress, setRaceProgress] = useState(0);
  const [penaltySeconds, setPenaltySeconds] = useState(0);
  const [targets, setTargets] = useState<FallingTarget[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [lockedTargetId, setLockedTargetId] = useState<number | null>(null);
  const [wordBuffer, setWordBuffer] = useState("");
  const [targetFeedback, setTargetFeedback] = useState("");
  const targetSpawnRef = useRef(0);
  const targetClearsRef = useRef(0);
  const levelRef = useRef(1);
  const weightsRef = useRef<Record<string, number>>({});
  const finishingRef = useRef(false);
  const penaltyRef = useRef(0);
  const [metrics, setMetrics] = useState<RunMetrics | null>(null);
  const [device, setDevice] = useState<"keyboard" | "touch">("keyboard");
  const [contentTier, setContentTier] = useState<ContentTier>(game.inputTier);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recordsRef = useRef<TypingRecord[]>([]);
  const prevValue = useRef("");
  const cursorRef = useRef(0);
  const composing = useRef(false);
  const simulation = useRef<SimulationState | null>(null);
  const startedAt = useRef(0);
  const pausedAt = useRef(0);
  const pausedTotal = useRef(0);
  const gamePrompt = useMemo(() => text, [text]);

  useEffect(() => {
    if (dailyChallenge) return;
    const timeout = window.setTimeout(() => {
      const stored = Number(localStorage.getItem("fingerfox-duration-v1"));
      const initialDuration = [30, 60, 90].includes(stored) ? stored : game.duration;
      setDuration(initialDuration); setRemaining(initialDuration);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [dailyChallenge, game.duration]);

  const begin = useCallback(async () => {
    inputRef.current?.focus();
    const storedDuration = Number(localStorage.getItem("fingerfox-duration-v1"));
    const roundLength = dailyChallenge ? game.duration : [30, 60, 90].includes(storedDuration) ? storedDuration : game.duration;
    const nextSeed = dailyChallenge?.seed ?? makeSeed();
    const weights = dailyChallenge ? {} : await getWeakKeyWeights();
    weightsRef.current = weights;
    const random = mulberry32(nextSeed);
    const mazeDirections = ["↑", "→", "↓", "←"];
    const prompt = game.mechanic === "rain" || game.mechanic === "blaster"
      ? ""
      : game.mechanic === "maze"
      ? Array.from({ length: mazeRouteLength(difficulty) }, () => mazeDirections[Math.floor(random() * mazeDirections.length)]).join("")
      : generatePrompt(nextSeed, game.mechanic === "slice" ? 260 : 160, weights, { contentTier: game.mechanic === "slice" ? "numbers" : contentTier, frequencyTier: frequencyForLevel(1, difficulty) });
    targetSpawnRef.current = 0;
    const openingTargets: FallingTarget[] = [];
    if (game.mechanic === "rain" || game.mechanic === "blaster") {
      const targetMechanic = game.mechanic;
      const openingCount = targetCapacity(difficulty, 1);
      for (let index = 0; index < openingCount; index++) {
        const target = makeFallingTarget(nextSeed, index, -index * 1500, weights, targetMechanic, difficulty, 1);
        openingTargets.push({ ...target, fallMs: target.fallMs + index * 4000 });
      }
    }
    targetSpawnRef.current = openingTargets.length;
    simulation.current = createSimulation(nextSeed, prompt, ["forge", "blaster", "maze"].includes(game.mechanic));
    targetClearsRef.current = 0; levelRef.current = 1;
    setSeed(nextSeed); setText(prompt); setIndex(0); setCorrectChars([]); cursorRef.current = 0; setMetrics(null); setScore(0); setStreak(0); setLives(startingLives(difficulty)); setRaceProgress(0); setPenaltySeconds(0); penaltyRef.current = 0; setTargets(openingTargets); setElapsedMs(0); setLockedTargetId(null); setWordBuffer(""); setTargetFeedback(""); setLevel(1); setWordsCompleted(0); setTargetsCleared(0); setImpact(null); finishingRef.current = false; setDuration(roundLength); setRemaining(roundLength); recordsRef.current = []; prevValue.current = ""; pausedTotal.current = 0; startedAt.current = Date.now(); setStatus("playing"); inputRef.current?.focus();
  }, [contentTier, dailyChallenge, difficulty, game.duration, game.mechanic]);

  const finish = useCallback(async () => {
    if (status !== "playing" || finishingRef.current) return;
    finishingRef.current = true;
    const elapsed = Math.min(duration * 1000, Date.now() - startedAt.current - pausedTotal.current);
    const result = calculateMetrics(recordsRef.current, Math.max(elapsed, 1000));
    setMetrics(result); setStatus("finished");
    const byKey: Record<string, { latency: number; errors: number; count: number }> = {};
    for (let i = 0; i < recordsRef.current.length; i++) { const { event, expected, correct } = recordsRef.current[i]; const key = expected === " " ? "space" : expected.toLowerCase(); const old = byKey[key] ?? { latency: 0, errors: 0, count: 0 }; const latency = i ? event.t - recordsRef.current[i - 1].event.t : 0; byKey[key] = { latency: old.latency + Math.max(0, latency), errors: old.errors + (correct ? 0 : 1), count: old.count + 1 }; }
    Object.keys(byKey).forEach((key) => { const value = byKey[key]; byKey[key] = { ...value, latency: value.count ? value.latency / value.count : 0 }; });
    const run = { id: `${seed}-${Date.now()}`, game: game.slug, wpm: result.wpm, accuracy: result.accuracy, raw: result.raw, errors: result.errors, duration: Math.round(elapsed / 1000), createdAt: Date.now(), byKey, score, level, difficulty, challengeDate: dailyChallenge?.dateKey };
    recordsRef.current = [];
    await saveRun(run);
    onRunSaved?.(run);
  }, [dailyChallenge?.dateKey, difficulty, duration, game.slug, level, onRunSaved, score, seed, status]);

  const clearFallingTarget = useCallback((target: FallingTarget, mechanic: "rain" | "blaster") => {
    const nextClearCount = targetClearsRef.current + 1;
    targetClearsRef.current = nextClearCount;
    setTargetsCleared(nextClearCount);
    const nextLevel = Math.floor(nextClearCount / 5) + 1;
    if (nextLevel > levelRef.current) { levelRef.current = nextLevel; setLevel(nextLevel); }
    setScore((value) => value + target.word.length * (1 + Math.floor(streak / 5)));
    setStreak((value) => value + 1);
    const now = Date.now() - startedAt.current - pausedTotal.current;
    const impactTop = Math.max(0, Math.min(82, ((elapsedMs - target.startAt) / target.fallMs) * 82));
    setImpact({ id: target.id, lane: target.lane, top: impactTop });
    const id = targetSpawnRef.current++;
    setTargets((current) => [...current.filter((item) => item.id !== target.id), makeFallingTarget(seed, id, now, weightsRef.current, mechanic, difficulty, levelRef.current)]);
  }, [difficulty, elapsedMs, seed, streak]);

  const handleCharacter = useCallback((value: string, kind: InputEvent["kind"], source: "keyboard" | "touch" = "keyboard") => {
    setDevice(source);
    if (kind === "escape") { if (status === "playing" || status === "paused") { const event: InputEvent = { char: "", t: performance.now(), kind }; simulation.current = simulation.current ? stepSimulation(simulation.current, 0, [event]) : null; if (status === "playing") { pausedAt.current = Date.now(); setStatus("paused"); } else { pausedTotal.current += Date.now() - pausedAt.current; setStatus("playing"); inputRef.current?.focus(); } } return; }
    if (status === "ready" || status === "finished") { if (kind === "char" || kind === "space") begin(); return; }
    if (status !== "playing") return;
    if (game.mechanic === "rain" || game.mechanic === "blaster") {
      if (kind === "backspace") {
        const nextBuffer = wordBuffer.slice(0, -1);
        setWordBuffer(nextBuffer);
        if (!nextBuffer) setLockedTargetId(null);
        return;
      }
      const isRain = game.mechanic === "rain";
      if (kind === "enter" && isRain) {
        const hit = targets.find((target) => target.word === wordBuffer);
        if (hit) {
          clearFallingTarget(hit, "rain");
          setWordBuffer(""); setLockedTargetId(null);
        } else { setStreak(0); setWordBuffer(""); setTargetFeedback("Type a complete word that is still falling, then press Enter."); }
        return;
      }
      if (kind !== "char" || value.length !== 1) return;
      const targetId = isRain ? null : lockedTargetId;
      const activeTarget = targetId === null
        ? undefined
        : targets.find((target) => target.id === targetId);
      let nextBuffer = wordBuffer + value;
      let candidate = isRain
        ? targets.find((target) => target.word.startsWith(nextBuffer))
        : activeTarget ?? targets.filter((target) => target.word.startsWith(value)).sort((a, b) => a.startAt + a.fallMs - (b.startAt + b.fallMs))[0];
      if (isRain && !candidate && wordBuffer) { nextBuffer = value; candidate = targets.find((target) => target.word.startsWith(nextBuffer)); }
      const expectedIndex = isRain && wordBuffer.length > 0 && nextBuffer.length === 1 ? 0 : wordBuffer.length;
      const expected = candidate?.word[expectedIndex] ?? value;
      const correct = Boolean(candidate && value === expected);
      const event: InputEvent = { char: value, t: performance.now() - pausedTotal.current, kind: "char" };
      recordsRef.current.push({ event, expected, correct });
      cursorRef.current += 1; setIndex(cursorRef.current);
      if (!correct || !candidate) {
        setStreak(0);
        if (!isRain && activeTarget) { setTargetFeedback("Wrong letter. Your ship stays locked; try that letter again."); return; }
        setWordBuffer(""); setLockedTargetId(null); setTargetFeedback("That word is not a live target. Choose one shown in the arena."); return;
      }
      setTargetFeedback("");
      if (!isRain && !activeTarget) setLockedTargetId(candidate.id);
      setWordBuffer(nextBuffer);
      if (!isRain && nextBuffer === candidate.word) {
        clearFallingTarget(candidate, "blaster");
        setWordBuffer(""); setLockedTargetId(null);
      }
      return;
    }
    if (kind === "backspace") { if (["forge", "blaster", "maze"].includes(game.mechanic)) return; const event: InputEvent = { char: "", t: performance.now(), kind }; if (simulation.current) simulation.current = stepSimulation(simulation.current, 0, [event]); cursorRef.current = Math.max(0, cursorRef.current - 1); setIndex(cursorRef.current); return; }
    if (kind !== "char" && kind !== "space") return;
    const char = kind === "space" ? " " : value;
    if (!char || char.length !== 1) return;
    const currentIndex = cursorRef.current;
    const correct = char === gamePrompt[currentIndex];
    const event: InputEvent = { char, t: performance.now() - pausedTotal.current, kind };
    if (simulation.current) simulation.current = stepSimulation(simulation.current, 0, [event]);
    const expected = gamePrompt[currentIndex];
    recordsRef.current.push({ event, expected, correct }); setCorrectChars((current) => { const next = current.slice(); next[currentIndex] = correct; return next; });
    if (correct) {
      const wordComplete = gamePrompt[currentIndex + 1] === " " || currentIndex === gamePrompt.length - 1;
      if (wordComplete || game.mechanic === "maze") {
        const bonus = game.mechanic === "rush" && remaining > duration / 2 ? 20 : game.mechanic === "slice" ? 10 : 1;
        setScore((value) => value + bonus);
        setStreak((value) => value + 1);
        const completed = wordsCompleted + 1;
        setWordsCompleted(completed);
        const nextLevel = game.mechanic === "maze" ? Math.floor(completed / 12) + 1 : Math.floor(completed / 8) + 1;
        if (nextLevel > levelRef.current) {
          levelRef.current = nextLevel;
          setLevel(nextLevel);
          if (game.mechanic === "maze") {
            const routeRandom = mulberry32((seed + Math.imul(nextLevel, 0x9e3779b9)) >>> 0);
            const directions = ["↑", "→", "↓", "←"];
            const extension = Array.from({ length: 12 }, () => directions[Math.floor(routeRandom() * directions.length)]).join("");
            setText((current) => `${current}${extension}`);
            simulation.current = simulation.current ? { ...simulation.current, prompt: `${simulation.current.prompt}${extension}`, ended: false } : simulation.current;
          } else {
            const extension = generatePrompt((seed + Math.imul(nextLevel, 0x9e3779b9)) >>> 0, 160, weightsRef.current, { contentTier: game.mechanic === "slice" ? "numbers" : contentTier, frequencyTier: frequencyForLevel(nextLevel, difficulty) });
            setText((current) => `${current} ${extension}`);
            simulation.current = simulation.current ? { ...simulation.current, prompt: `${simulation.current.prompt} ${extension}`, ended: false } : simulation.current;
          }
        }
      }
      cursorRef.current = Math.min(currentIndex + 1, gamePrompt.length);
    } else {
      setStreak(0);
      if (game.mechanic === "watch") setLives((value) => { const next = value - 1; if (next <= 0) window.setTimeout(() => void finish(), 0); return Math.max(0, next); });
      if (game.mechanic === "defuse") { const penalty = defusePenalty(difficulty, levelRef.current); penaltyRef.current += penalty; setPenaltySeconds((value) => value + penalty); setRemaining((value) => Math.max(0, value - penalty)); }
      if (game.mechanic === "forge" || game.mechanic === "maze") cursorRef.current = currentIndex;
      else cursorRef.current = Math.min(currentIndex + 1, gamePrompt.length);
    }
    setIndex(cursorRef.current);
  }, [begin, clearFallingTarget, contentTier, difficulty, duration, finish, game.mechanic, gamePrompt, lockedTargetId, remaining, seed, status, targets, wordBuffer, wordsCompleted]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLElement && event.target.closest("button, a, select, input:not(textarea)")) return;
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
      const adapted = adaptDesktopKey(event, performance.now());
      if (game.mechanic === "maze" && event.key.startsWith("Arrow")) {
        event.preventDefault();
        handleCharacter(({ ArrowUp: "↑", ArrowRight: "→", ArrowDown: "↓", ArrowLeft: "←" } as Record<string, string>)[event.key], "char");
        return;
      }
      if (!adapted) return;
      event.preventDefault(); handleCharacter(adapted.char, adapted.kind);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [game.mechanic, handleCharacter]);

  useEffect(() => {
    if (status !== "playing") return;
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt.current - pausedTotal.current;
      const seconds = Math.max(0, duration - Math.floor(elapsed / 1000) - penaltyRef.current);
      setRemaining(seconds);
      if (seconds === 0) void finish();
      if (game.mechanic === "race") setRaceProgress(Math.min(100, Math.floor((elapsed / 1000 / duration) * 100 * raceSpeed(difficulty, levelRef.current) / 45)));
      if (game.mechanic === "rain" || game.mechanic === "blaster") {
        setElapsedMs(elapsed);
        const expired = targets.filter((target) => elapsed >= target.startAt + target.fallMs);
        if (expired.length) {
          setLives((value) => Math.max(0, value - expired.length));
          setStreak(0);
          setWordBuffer(""); setLockedTargetId(null);
          setTargetFeedback(game.mechanic === "rain" ? "A word reached the floor. One life lost." : "A ship reached the base. One life lost.");
          const mechanic = game.mechanic;
          const refill = expired.map(() => { const id = targetSpawnRef.current++; return makeFallingTarget(seed, id, elapsed, weightsRef.current, mechanic, difficulty, levelRef.current); });
          setTargets((current) => [...current.filter((target) => !expired.some((missed) => missed.id === target.id)), ...refill]);
          if (lives <= expired.length) window.setTimeout(() => void finish(), 0);
        }
        const capacity = targetCapacity(difficulty, levelRef.current);
        if (targets.length < capacity) {
          const id = targetSpawnRef.current++;
          const mechanic = game.mechanic;
          const newcomer = makeFallingTarget(seed, id, elapsed, weightsRef.current, mechanic, difficulty, levelRef.current);
          setTargets((current) => current.length < capacity ? [...current, newcomer] : current);
        }
      }
    }, 200);
    return () => window.clearInterval(timer);
  }, [difficulty, duration, finish, game.mechanic, lives, seed, status, targets]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const updateViewport = () => document.documentElement.style.setProperty("--visual-viewport-height", `${viewport.height}px`);
    updateViewport(); viewport.addEventListener("resize", updateViewport);
    return () => viewport.removeEventListener("resize", updateViewport);
  }, []);

  function onMobileChange(value: string) {
    if (composing.current) return;
    const old = prevValue.current;
    const events = diffMobileInput(old, value, performance.now()); prevValue.current = "";
    for (const event of events) handleCharacter(event.char, event.kind, "touch");
    requestAnimationFrame(() => { if (inputRef.current) { inputRef.current.value = ""; prevValue.current = ""; } });
  }

  function onMobileBeforeInput(event: React.FormEvent<HTMLTextAreaElement>) {
    const nativeEvent = event.nativeEvent as Event & { inputType?: string };
    if (nativeEvent.inputType === "deleteContentBackward" && event.currentTarget.value.length === 0) {
      event.preventDefault();
      handleCharacter("", "backspace", "touch");
    }
  }

  const percentage = gamePrompt.length ? Math.min(index / 300, 1) : 0;
  const instructions: Record<GameDefinition["mechanic"], string> = {
    zen: "Type at your own pace. Mistakes count, but they never interrupt your flow.",
    forge: "Misses hold your place. Type the highlighted key correctly to forge ahead.",
    rain: "Type any falling word and press Enter before it reaches the floor. Clear five words to level up.",
    blaster: "Type a ship’s first letter to lock on, then finish its word to destroy it. Clear five targets to level up.",
    race: "Keep ahead of the 45 WPM pace car to win the race.",
    watch: "You have three lives. Each wrong key costs one.",
    slice: "Every short number token you finish adds slice points.",
    lanes: "Complete each word to move your runner to the next lane.",
    maze: "Follow the arrows with your keyboard arrow keys or the direction pad.",
    rush: "Double points are active in the first half of this sprint.",
    defuse: "Each mistake removes time from the clock. Penalties grow with difficulty and level."
  };
  const lane = Math.floor(score % 3);
  const targetMode = game.mechanic === "rain" || game.mechanic === "blaster";
  const levelStep = targetMode ? 5 : game.mechanic === "maze" ? 12 : 8;
  const levelProgress = ((targetMode ? targetsCleared : wordsCompleted) % levelStep) / levelStep;
  const playerRacePosition = Math.min(100, Math.round(index / Math.max(1, duration / 60 * 225) * 100));
  const windowStart = Math.max(0, index - 28);
  const visiblePrompt = gamePrompt.slice(windowStart, Math.min(gamePrompt.length, windowStart + 120));
  const gameInput = <textarea ref={inputRef} className="game-input" aria-label={targetMode ? "Type a falling target word" : game.mechanic === "maze" ? "Keyboard focus for arrow-key maze" : "Type the text shown above"} autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false} enterKeyHint="done" inputMode={game.mechanic === "maze" ? "none" : "text"} onBeforeInput={onMobileBeforeInput} onChange={(e) => onMobileChange(e.currentTarget.value)} onCompositionStart={() => { composing.current = true; }} onCompositionUpdate={() => {}} onCompositionEnd={(e) => { composing.current = false; onMobileChange(e.currentTarget.value); }} />;
  return <div className="game-layout">
    <div className="page-heading"><p className="eyebrow">{game.tier.toUpperCase()} · {duration} SECOND ROUND</p><h1>{game.name}</h1><p>{game.description}</p></div>
    <section className="panel" aria-label={`${game.name} typing game`}>
      <div className="game-toolbar"><span className="toolbar-options">{status === "ready" && !dailyChallenge && <label className="tier-control" htmlFor="difficulty">Difficulty <select id="difficulty" value={difficulty} onChange={(event) => setDifficulty(event.currentTarget.value as Difficulty)}><option value="easy">Easy</option><option value="standard">Standard</option><option value="hard">Hard</option></select></label>}{status === "ready" && !["maze", "slice", "rain", "blaster"].includes(game.mechanic) && <label className="tier-control" htmlFor="content-tier">Text set <select id="content-tier" value={contentTier} onChange={(event) => setContentTier(event.currentTarget.value as ContentTier)}>{["lowercase", "capitals", "punctuation", "numbers", "symbols"].map((tier) => <option key={tier} value={tier}>{tier}</option>)}</select></label>}{(status !== "ready" || dailyChallenge) && <span>{dailyChallenge ? `Daily · ${difficultyLabel(difficulty)}` : `${difficultyLabel(difficulty)} difficulty`}</span>}{status === "paused" ? "Paused" : status === "finished" ? "Round complete" : status === "playing" ? `${device === "touch" ? "Touch" : "Keyboard"} practice` : null}</span><span>{`${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`}</span></div>
      <div className="level-hud"><span className="level-number">Level {level}</span><span className="level-track" role="progressbar" aria-label="Progress to next level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(levelProgress * 100)}><i style={{ width: `${levelProgress * 100}%` }} /></span><span className="level-hint">{targetMode ? `${targetsCleared % 5}/5 targets` : game.mechanic === "maze" ? `${wordsCompleted % 12}/12 moves` : `${wordsCompleted % 8}/8 words`}</span></div>
      <p className="mechanic-instructions">{instructions[game.mechanic]}</p>
      {game.mechanic === "race" && <div className="race-track" aria-label={`Your position ${playerRacePosition} percent, pace car ${raceProgress} percent`}><span style={{ left: `${raceProgress}%` }}>Pace car</span><i style={{ left: `${playerRacePosition}%` }}>You</i></div>}
      {game.mechanic === "lanes" && <div className="lane-track" aria-label={`Runner is in lane ${lane + 1}`}>{[0, 1, 2].map((value) => <span key={value} className={value === lane ? "lane-active" : ""}>Lane {value + 1}{value === lane && <strong>Runner</strong>}</span>)}</div>}
      <div className="mechanic-hud" aria-live="polite">{(game.mechanic === "watch" || targetMode) && <span>Lives: <strong className="text-red">{lives} / {startingLives(difficulty)}</strong></span>}{["rain", "blaster", "slice"].includes(game.mechanic) && <span>{game.mechanic === "rain" ? "Words cleared" : game.mechanic === "slice" ? "Slices" : "Targets destroyed"}: <strong>{targetMode ? targetsCleared : score}</strong></span>}{game.mechanic === "blaster" && <span>Combo: <strong>{streak}</strong></span>}{game.mechanic === "rush" && <span>Score: <strong>{score}</strong> · {remaining > duration / 2 ? "2× bonus" : "standard points"}</span>}{game.mechanic === "defuse" && <span>Penalty time: <strong>{penaltySeconds}s</strong></span>}</div>
      {targetMode ? <div className={`target-arena ${game.mechanic === "rain" ? "rain-arena" : "blaster-arena"}`} role="group" aria-label={game.mechanic === "rain" ? "Falling words. Type any visible word and press Enter to clear it." : "Falling ships. Type the first letter to lock a ship, then finish its word to destroy it."} onClick={() => inputRef.current?.focus()}>
        {targets.map((target) => <span key={target.id} className={`falling-target${target.id === lockedTargetId ? " target-locked" : ""}`} style={{ left: `${target.lane}%`, top: `${Math.max(0, Math.min(82, ((elapsedMs - target.startAt) / target.fallMs) * 82))}%` }} aria-label={`${target.word}${target.id === lockedTargetId ? `, ${wordBuffer.length} letters typed` : ""}`}><b aria-hidden="true">{game.mechanic === "rain" ? "↓" : "✦"}</b> {target.word}</span>)}
        {impact && <span key={impact.id} className="target-impact" style={{ left: `${impact.lane}%`, top: `${impact.top}%` }} aria-hidden="true" onAnimationEnd={() => setImpact(null)} />}
        <div className="target-base" aria-hidden="true" />
        <div className="target-buffer" aria-live="polite">{game.mechanic === "rain" ? `Word: ${wordBuffer || "type any visible word"} · press Enter` : `Target: ${wordBuffer || "type a first letter to lock on"}`}</div>
        {targetFeedback && <span className="target-feedback" role="status">{targetFeedback}</span>}
        {gameInput}
      </div> : <div className={`typing-area${game.mechanic === "maze" ? " maze-prompt" : ""}`} role="group" aria-label={game.mechanic === "maze" ? "Maze route. Follow each arrow." : "Typing prompt. Focus here and type the shown text."}>
        {gamePrompt ? [...visiblePrompt].map((char, i) => { const absoluteIndex = windowStart + i; const statusClass = absoluteIndex < index ? correctChars[absoluteIndex] ? "done" : "wrong" : absoluteIndex === index ? correctChars[absoluteIndex] === false ? "wrong" : "current" : "upcoming"; return <span key={absoluteIndex} className={statusClass}>{char}</span>; }) : <span className="upcoming">Press start to begin</span>}
        {gameInput}
      </div>}
      {game.mechanic === "maze" && status === "playing" && <div className="maze-pad" aria-label="Maze direction pad">{([["↑", "↑"], ["←", "←"], ["↓", "↓"], ["→", "→"]] as const).map(([label, value]) => <button key={label} className="button button-outline" aria-label={`Move ${label === "↑" ? "up" : label === "↓" ? "down" : label === "←" ? "left" : "right"}`} onClick={() => { handleCharacter(value, "char", "touch"); inputRef.current?.focus(); }}>{label}</button>)}</div>}
      <p className="game-help">{status === "ready" ? "Select start, then type the highlighted character. Press Esc to pause." : status === "paused" ? "Press Esc or resume when you are ready." : status === "playing" && game.mechanic === "rain" ? `${targets.length} falling words · type any visible word and press Enter · ${lives} lives left` : status === "playing" && game.mechanic === "blaster" ? `${targets.length} ships on screen · finish a locked word to fire · ${lives} lives left` : status === "playing" ? `${Math.round(percentage * 100)}% through the prompt · ${index} characters typed` : "Your result is saved locally on this device."}</p>
      <span className="sr-only" aria-live="polite">{status === "playing" ? `${Math.floor(index / 10) * 10} characters typed` : status === "paused" ? "Round paused" : status === "finished" ? "Round finished. Results are shown below." : ""}</span>
      <div className="game-actions">{status === "ready" && <button className="button button-primary" onClick={() => void begin()}>Start round <span aria-hidden="true">↗</span></button>}{status === "playing" && <button className="button button-outline" onClick={() => handleCharacter("", "escape")}>Pause with Esc</button>}{status === "paused" && <button className="button button-primary" onClick={() => handleCharacter("", "escape")}>Resume round</button>}{status === "finished" && <button className="button button-primary" onClick={() => void begin()}>Play again <span aria-hidden="true">↗</span></button>}</div>
    </section>
    {metrics && <section className="panel results" aria-live="polite"><p className="eyebrow">Your result</p><h2>{game.mechanic === "race" ? playerRacePosition >= raceProgress ? "You beat the pace car." : "The pace car finished ahead." : game.mechanic === "watch" && lives === 0 ? "The night shift got you." : (game.mechanic === "rain" || game.mechanic === "blaster") && lives === 0 ? game.mechanic === "rain" ? "The rain reached the ground." : "The ships reached your base." : game.mechanic === "maze" ? "Maze run complete." : "Nice work. Here is your round."}</h2><div className="result-grid"><div className="metric"><strong>{metrics.wpm}</strong><span>correct WPM</span></div><div className="metric"><strong>{metrics.raw}</strong><span>raw WPM</span></div><div className="metric"><strong>{metrics.accuracy}%</strong><span>accuracy</span></div><div className="metric"><strong>{metrics.consistency}%</strong><span>consistency</span></div></div><p className="result-message">{metrics.errors} errors · WPM = correct characters ÷ 5 ÷ minutes. Corrections don’t erase an earlier mistake.{["blaster", "slice", "rain", "rush"].includes(game.mechanic) ? ` Challenge score: ${score}.` : ""}</p><div className="game-actions"><Link className="button button-outline" href="/stats">View all stats</Link><button className="button button-primary" onClick={() => void begin()}>Try again <span aria-hidden="true">↗</span></button></div></section>}
    <button className="mobile-refocus" onClick={() => inputRef.current?.focus()}>Tap to type</button>
  </div>;
}
