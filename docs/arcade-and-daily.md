# Arcade progression and daily challenge

## Difficulty and levels

Every game lets the player choose Easy, Standard, or Hard before starting. Difficulty changes the game rules: falling targets move slower or faster and provide different starting lives, the maze route grows, the race pace car changes speed, and Defuse Key charges a different time penalty. Daily Challenge fixes the selected difficulty for everyone.

Typing games level up after eight completed words. Maze Keys levels up every twelve correct directions. Word Rain and Star Blaster level up every five targets cleared. New typing levels append a seeded prompt with a wider word-frequency tier. Target levels add more simultaneous targets and increase target speed. The HUD exposes level and progress to the next level.

## Daily challenge

The UTC calendar date deterministically selects one enabled game, difficulty, and unsigned 32-bit seed. The prompt is seeded and weak-key personalization is disabled for the challenge, so the same challenge setup is shared across visits on that UTC date. Attempts are still played locally and the best WPM for that challenge date is shown only on that device. There is no online ranking or submission.

The challenge reuses the existing IndexedDB `runs` store. Its summaries include the optional `challengeDate`, difficulty, level, and score fields. No new cookies or localStorage keys are introduced.
