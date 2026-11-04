import type { Metadata } from "next";
import { StatsDashboard } from "@/features/stats/dashboard";
import { pageMetadata } from "@/lib/seo";
export const metadata: Metadata = pageMetadata({ title: "Your Typing Stats", description: "Review your personal words-per-minute, accuracy, consistency, and keyboard practice history saved in this browser.", path: "/stats", noIndex: true });
export default function StatsPage() { return <main className="page-shell"><StatsDashboard /></main>; }
