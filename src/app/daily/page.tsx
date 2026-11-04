import type { Metadata } from "next";
import { DailyChallengePanel } from "@/features/daily/challenge-panel";

export const metadata: Metadata = { title: "Daily challenge", description: "Play today's seeded FingerFox typing challenge." };

export default function DailyPage() {
  return <DailyChallengePanel />;
}
