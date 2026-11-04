import { games } from "@/games/registry";
import type { Difficulty } from "@/games/shared/difficulty";

export type DailyChallenge = { dateKey: string; seed: number; gameSlug: string; difficulty: Difficulty };

export function dailyChallengeFor(dateKey: string): DailyChallenge {
  const [year, month, day] = dateKey.split("-").map(Number);
  const dayNumber = Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
  const seed = (Math.imul(dayNumber ^ 0x6d2b79f5, 0x45d9f3b) ^ 0x9e3779b9) >>> 0;
  const enabledGames = games.filter((game) => game.enabled);
  const gameIndex = ((dayNumber % enabledGames.length) + enabledGames.length) % enabledGames.length;
  const difficulties: Difficulty[] = ["easy", "standard", "hard"];
  return { dateKey, seed, gameSlug: enabledGames[gameIndex].slug, difficulty: difficulties[((dayNumber % 3) + 3) % 3] };
}

export function utcDateKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}
