import { englishWords, numberTokens, punctuationMarks, symbolTokens } from "./word-lists/en";
import { mulberry32 } from "../loop/rng";

export type ContentTier = "lowercase" | "capitals" | "punctuation" | "numbers" | "symbols";
export type FrequencyTier = "common" | "standard" | "extended";
export type GeneratorOptions = { contentTier?: ContentTier; frequencyTier?: FrequencyTier };

export const wordBank = englishWords.highFrequency;

export function generatePrompt(seed: number, length = 180, weights: Record<string, number> = {}, options: GeneratorOptions = {}) {
  const random = mulberry32(seed);
  const frequencyTier = options.frequencyTier ?? "common";
  const contentTier = options.contentTier ?? "lowercase";
  const sourceWords = frequencyTier === "common"
    ? englishWords.highFrequency
    : frequencyTier === "standard"
      ? [...englishWords.highFrequency, ...englishWords.mediumFrequency]
      : [...englishWords.highFrequency, ...englishWords.mediumFrequency, ...englishWords.extended];
  const weighted = sourceWords.map((word) => ({ word, weight: 1 + [...word].reduce((sum, key) => sum + Math.max(0, Math.min(3, weights[key] ?? 0)), 0) }));
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  const words: string[] = [];
  let chars = 0;
  while (chars < length) {
    let target = random() * total;
    let choice: string = weighted[0].word;
    for (const item of weighted) { target -= item.weight; if (target <= 0) { choice = item.word; break; } }
    if (contentTier === "capitals") choice = choice[0].toUpperCase() + choice.slice(1);
    if (contentTier === "punctuation") choice += punctuationMarks[Math.floor(random() * punctuationMarks.length)];
    if (contentTier === "numbers") choice = numberTokens[Math.floor(random() * numberTokens.length)];
    if (contentTier === "symbols" && random() < 0.38) choice += symbolTokens[Math.floor(random() * symbolTokens.length)];
    words.push(choice);
    chars += choice.length + 1;
  }
  return words.join(" ");
}
