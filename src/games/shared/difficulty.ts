export type Difficulty = "easy" | "standard" | "hard";

export function difficultyLabel(value: Difficulty) {
  return value === "easy" ? "Easy" : value === "hard" ? "Hard" : "Standard";
}

export function frequencyForLevel(level: number, difficulty: Difficulty) {
  if (difficulty === "easy") return level >= 4 ? "standard" as const : "common" as const;
  if (difficulty === "hard") return level >= 2 ? "extended" as const : "standard" as const;
  return level >= 3 ? "extended" as const : "standard" as const;
}

export function startingLives(difficulty: Difficulty) {
  return difficulty === "easy" ? 5 : difficulty === "hard" ? 2 : 3;
}

export function targetCapacity(difficulty: Difficulty, level: number) {
  const base = difficulty === "easy" ? 4 : difficulty === "hard" ? 6 : 5;
  return Math.min(8, base + level - 1);
}

export function mazeRouteLength(difficulty: Difficulty) {
  return difficulty === "easy" ? 24 : difficulty === "hard" ? 48 : 36;
}

export function defusePenalty(difficulty: Difficulty, level: number) {
  const base = difficulty === "easy" ? 1 : difficulty === "hard" ? 5 : 3;
  return base + Math.floor((level - 1) / 2);
}

export function raceSpeed(difficulty: Difficulty, level: number) {
  const base = difficulty === "easy" ? 35 : difficulty === "hard" ? 60 : 45;
  return base + (level - 1) * 5;
}
