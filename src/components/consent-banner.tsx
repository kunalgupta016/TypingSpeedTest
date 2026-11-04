"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const timeout = window.setTimeout(() => setVisible(localStorage.getItem("fingerfox-consent-v1") === null), 0); return () => window.clearTimeout(timeout); }, []);
  function choose(value: "accepted" | "rejected") { localStorage.setItem("fingerfox-consent-v1", value); setVisible(false); }
  if (!visible) return null;
  return <aside className="consent-banner" aria-label="Cookie preferences"><div><strong>Your privacy choices</strong><p>FingerFox uses essential browser storage to remember this choice and save guest progress. No advertising or analytics cookies are used.</p><Link href="/cookies">Read the cookie policy</Link></div><div className="consent-actions"><button className="button button-outline" onClick={() => choose("rejected")}>Reject optional</button><button className="button button-outline" onClick={() => choose("accepted")}>Accept</button></div></aside>;
}

