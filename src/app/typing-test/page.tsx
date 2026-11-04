import type { Metadata } from "next";
import { TypingSession } from "@/games/shared/typing-session";
import { getGame } from "@/games/registry";
export const metadata: Metadata = { title: "Free online typing test", description: "Take a free one-minute typing test and see your speed, accuracy, and consistency." };
export default function TypingTestPage() { return <main className="page-shell"><TypingSession game={getGame("zen-test")!} /></main>; }
