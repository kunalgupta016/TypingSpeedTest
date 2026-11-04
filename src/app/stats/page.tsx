import type { Metadata } from "next";
import { StatsDashboard } from "@/features/stats/dashboard";
export const metadata: Metadata = { title: "Your typing stats", description: "Review typing practice progress saved on this device." };
export default function StatsPage() { return <main className="page-shell"><StatsDashboard /></main>; }
