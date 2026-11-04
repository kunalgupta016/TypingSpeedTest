"use client";

import { useEffect, useRef, useState } from "react";
import { clearRuns } from "@/lib/db";
import { ThemeControl } from "@/components/theme-control";

function ConfirmDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const [typed, setTyped] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { input.current?.focus(); }, []);

  function keepFocusInside(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") { event.preventDefault(); onCancel(); return; }
    if (event.key !== "Tab") return;
    const controls = event.currentTarget.querySelectorAll<HTMLElement>("input, button:not(:disabled)");
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  return <div className="confirm-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
    <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description" onKeyDown={keepFocusInside}>
      <p className="eyebrow">Confirm deletion</p><h2 id="confirm-title">Clear data from this browser?</h2>
      <p id="confirm-description">This removes saved run summaries, key practice data, and the current consent choice.</p>
      <label htmlFor="confirm-clear">Type CLEAR to confirm</label>
      <input ref={input} id="confirm-clear" autoComplete="off" autoCapitalize="characters" value={typed} onChange={(event) => setTyped(event.target.value)} placeholder="CLEAR" />
      <div className="game-actions"><button className="button button-outline" onClick={onCancel}>Cancel</button><button className="button button-primary" disabled={typed !== "CLEAR"} onClick={onConfirm}>Delete local data</button></div>
    </section>
  </div>;
}

export function SettingsPanel() {
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const [roundDuration, setRoundDuration] = useState("60");
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const stored = localStorage.getItem("fingerfox-duration-v1");
      if (stored && ["30", "60", "90"].includes(stored)) setRoundDuration(stored);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);
  async function clear() {
    await clearRuns();
    localStorage.removeItem("fingerfox-consent-v1");
    localStorage.removeItem("fingerfox-duration-v1");
    localStorage.removeItem("fingerfox-theme-v1");
    document.documentElement.dataset.theme = "system";
    window.dispatchEvent(new Event("fingerfox-theme-reset"));
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      const appRegistrations = registrations.filter((registration) => registration.active?.scriptURL.endsWith("/sw.js"));
      appRegistrations.forEach((registration) => registration.active?.postMessage("CLEAR_LOCAL_DATA"));
      await Promise.all(appRegistrations.map((registration) => registration.unregister()));
    }
    if ("caches" in window) await caches.delete("fingerfox-shell-v1");
    setDone(true);
    setConfirm(false);
  }
  function changeDuration(value: string) {
    setRoundDuration(value);
    localStorage.setItem("fingerfox-duration-v1", value);
  }
  return <section className="panel stats-card">
    <p className="eyebrow">Local data</p><h2>Clear your guest data</h2>
    <p>Your saved run summaries, weak-key model, offline shell cache, and cookie preference are stored in this browser.</p>
    {done && <p role="status">Local data cleared.</p>}
    <button className="button button-outline" onClick={() => setConfirm(true)}>Clear local data</button>
    <div style={{ marginTop: 22 }}><ThemeControl /></div>
    <div className="settings-row"><label htmlFor="round-duration">Game pace</label><select id="round-duration" className="tier-select" value={roundDuration} onChange={(event) => changeDuration(event.currentTarget.value)}><option value="90">Calm · 90 seconds</option><option value="60">Steady · 60 seconds</option><option value="30">Quick · 30 seconds</option></select></div>
    {confirm && <ConfirmDialog onCancel={() => setConfirm(false)} onConfirm={() => void clear()} />}
  </section>;
}
