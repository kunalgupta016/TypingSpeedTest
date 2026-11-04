import { DailyChallengePanel } from "@/features/daily/challenge-panel";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Daily Typing Challenge",
  description: "Play the free daily typing challenge. Everyone gets the same seeded prompt, with your result and practice history saved on your device.",
  path: "/daily",
});

export default function DailyPage() {
  return <DailyChallengePanel />;
}
