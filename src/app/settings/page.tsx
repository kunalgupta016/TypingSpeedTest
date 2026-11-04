import type { Metadata } from "next";
import { SettingsPanel } from "@/features/settings/panel";
import { pageMetadata } from "@/lib/seo";
export const metadata: Metadata = pageMetadata({ title: "Settings and Local Data", description: "Manage FingerFox display preferences, typing round length, and practice data stored in your browser.", path: "/settings", noIndex: true });
export default function SettingsPage() { return <main className="page-shell"><div className="page-heading"><p className="eyebrow">YOUR DEVICE</p><h1>Settings and data.</h1><p>Manage the guest data stored in this browser.</p></div><SettingsPanel /></main>; }
