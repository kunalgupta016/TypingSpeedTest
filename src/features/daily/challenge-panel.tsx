"use client";

import { useCallback, useEffect, useState } from "react";
import { TypingSession } from "@/games/shared/typing-session";
import { dailyChallengeFor, utcDateKey, type DailyChallenge } from "@/games/daily-challenge";
import { games } from "@/games/registry";
import { difficultyLabel } from "@/games/shared/difficulty";
import { getRuns, type SavedRun } from "@/lib/db";

export function DailyChallengePanel() {
  const [challenge] = useState<DailyChallenge>(() => dailyChallengeFor(utcDateKey()));
  const [best, setBest] = useState<SavedRun | null>(null);

  useEffect(() => {
    const today = challenge;
    void getRuns().then((runs) => {
      const attempts = runs.filter((run) => run.challengeDate === today.dateKey);
      setBest(attempts.reduce<SavedRun | null>((current, run) => !current || run.wpm > current.wpm ? run : current, null));
    });
  }, [challenge]);

  const onRunSaved = useCallback((run: SavedRun) => {
    setBest((current) => !current || run.wpm > current.wpm ? run : current);
  }, []);

  if (!challenge) return <main className="page-shell"><div className="panel daily-intro" aria-busy="true"><p className="eyebrow">Daily challenge</p><h1>Preparing today’s run</h1></div></main>;
  const game = games.find((item) => item.slug === challenge.gameSlug);
  if (!game) return null;

  return <main className="page-shell daily-page">
    <section className="panel daily-intro">
      <p className="eyebrow">Same seed for everyone · UTC day</p>
      <h1>Daily challenge</h1>
      <p className="lead">One shared game, word set, and difficulty for today. Your score stays on this device.</p>
      <div className="daily-details"><span>{challenge.dateKey}</span><span>{game.name}</span><span>{difficultyLabel(challenge.difficulty)}</span></div>
      <p className="daily-best" aria-live="polite">{best ? `Your best today: ${best.wpm} WPM · ${best.accuracy}% accuracy` : "No attempt saved today yet. Set your first score."}</p>
    </section>
    <TypingSession game={game} dailyChallenge={challenge} onRunSaved={onRunSaved} />
  </main>;
}
