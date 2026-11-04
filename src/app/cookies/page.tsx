import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Cookie and storage policy" };

export default function CookiesPage() {
  return <main className="page-shell text-page">
    <p className="eyebrow">Cookie policy - Version 1.0.0</p>
    <h1>What FingerFox stores.</h1>
    <p className="lead">This version does not set browser cookies or load advertising trackers.</p>
    <div className="prose">
      <h2>Local storage</h2>
      <ul>
        <li><code>localStorage: fingerfox-consent-v1</code> remembers your accept or reject choice.</li>
        <li><code>localStorage: fingerfox-duration-v1</code> stores your selected 30, 60, or 90 second round length.</li>
        <li><code>localStorage: fingerfox-theme-v1</code> stores System, Light, or Dark appearance preference.</li>
        <li><code>IndexedDB: fingerfox-local</code>, object store <code>runs</code>, stores guest run summaries and per-run aggregated key data.</li>
        <li><code>IndexedDB: fingerfox-local</code>, object store <code>keys</code>, stores average latency, error rate, and sample count by key for prompt personalization.</li>
        <li><code>CacheStorage: fingerfox-shell-v1</code> stores the offline page shell and static app assets.</li>
      </ul>
      <p>There are no other application storage keys in this version. Browser, operating system, or hosting infrastructure may keep their own technical data outside the app storage.</p>
      <h2>Your choice</h2>
      <p>Accept and Reject are offered with equal weight. Either choice keeps the local storage needed for the game and requested stats. Neither enables advertising or analytics. You can clear FingerFox storage from <Link href="/settings">Settings</Link> or your browser site data controls.</p>
      <p>Cookie policy version 1.0.0. Last updated November 2, 2026.</p>
    </div>
  </main>;
}
