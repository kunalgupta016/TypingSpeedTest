import type { Metadata } from "next";
import { SettingsPanel } from "@/features/settings/panel";
export const metadata: Metadata = { title: "Settings and data" };
export default function SettingsPage() { return <main className="page-shell"><div className="page-heading"><p className="eyebrow">YOUR DEVICE</p><h1>Settings and data.</h1><p>Manage the guest data stored in this browser.</p></div><SettingsPanel /></main>; }
