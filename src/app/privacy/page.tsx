import type { Metadata } from "next";
import Link from "next/link";
import { business } from "../../../config/business";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  const hasContact = !business.grievanceContact.startsWith("PLACEHOLDER");
  return <main className="page-shell text-page">
    <p className="eyebrow">Privacy policy - Version 1.0.0</p>
    <h1>Your practice stays on your device.</h1>
    <p className="lead">This policy describes the current guest-only FingerFox website.</p>
    <div className="prose">
      <p>Effective November 2, 2026. FingerFox currently has no accounts, advertising, analytics, cloud leaderboard, or contact form.</p>
      <h2>Information stored</h2>
      <p>When you play, this browser stores run summaries in IndexedDB database <code>fingerfox-local</code>, store <code>runs</code>. A summary contains game, score, level, difficulty, optional daily challenge date, accuracy, errors, duration, date, and aggregated per-key counts and average latency. Store <code>keys</code> keeps per-key exponentially weighted average latency, error rate, and sample count to personalize future prompts. The localStorage keys <code>fingerfox-consent-v1</code>, <code>fingerfox-duration-v1</code>, and <code>fingerfox-theme-v1</code> hold your consent choice, round-length, and appearance preferences. CacheStorage <code>fingerfox-shell-v1</code> holds offline pages and static app assets. The application does not store raw keystroke logs. There are no cookies in this version.</p>
      <h2>Why we use it</h2>
      <p>Run summaries support your stats page and personal keyboard heatmap. Your consent choice remembers your selection. The round-length setting applies your selected game pace. This data is not sent to a FingerFox server by the current app.</p>
      <h2>Retention and deletion</h2>
      <p>Data remains in your browser until you clear it, clear browser site data, or remove it from <Link href="/settings">Settings</Link>. You can export run summaries, the aggregated key model, and round-length preference as JSON from the stats page. Clearing local data removes the local copy.</p>
      <h2>Children and accounts</h2>
      <p>There are no accounts or age prompt in this guest-only version. No advertising or tracking is used. Accounts are not available.</p>
      <h2>Security and third parties</h2>
      <p>Static page hosting may process routine network requests to deliver the website. The app does not intentionally save IP addresses. No third-party advertising or analytics SDK is included. Review the <Link href="/cookies">Cookie policy</Link>.</p>
      <h2>Your requests</h2>
      <p>Because guest data stays on your device, you can export or delete it directly. {hasContact ? <>Contact the project privacy representative at <a href={`mailto:${business.grievanceContact}`}>{business.grievanceContact}</a>.</> : <>The project operator has not supplied a privacy request email yet. Contact details are required before production. See the <Link href="/contact">contact page</Link>.</>}</p>
      <p>Policy version 1.0.0. Last updated November 2, 2026.</p>
    </div>
  </main>;
}
