import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGame, games } from "@/games/registry";
import { TypingSession } from "@/games/shared/typing-session";
import { pageMetadata } from "@/lib/seo";
export function generateStaticParams() { return games.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const game = getGame(slug); return game ? pageMetadata({ title: `${game.name}: Free Online Typing Game`, description: `${game.description} Free to play online.`, path: `/games/${game.slug}` }) : {}; }
export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const game = getGame(slug); if (!game || !game.enabled) notFound(); return <main className="page-shell"><TypingSession game={game} /></main>; }
