import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Leaderboard" };
export default function LeaderboardPage() { return <main className="page-shell text-page"><p className="eyebrow">Leaderboard</p><h1>A place for friendly competition.</h1><p className="lead">Online leaderboards are not available in this local-first release.</p><div className="prose"><p>FingerFox currently keeps practice data in your browser. No score is uploaded or compared with other players, and there is no live player count. Keep an eye on your own progress on the <Link href="/stats">stats page</Link>.</p><p><Link href="/games">Play a game →</Link></p></div></main>; }
