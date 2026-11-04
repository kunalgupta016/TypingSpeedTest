import { TypingSession } from "@/games/shared/typing-session";
import { getGame } from "@/games/registry";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({
  title: "Free Online Typing Test",
  description: "Take a free one-minute typing test to check your words per minute, accuracy, and consistency. No sign-up needed; your result stays in your browser.",
  path: "/typing-test",
});
export default function TypingTestPage() { return <main className="page-shell"><TypingSession game={getGame("zen-test")!} /></main>; }
