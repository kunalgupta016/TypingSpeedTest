"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRuns, getWeakKeyModel, type SavedRun } from "@/lib/db";

export function StatsDashboard() {
  const [runs, setRuns] = useState<SavedRun[]>([]);
  useEffect(() => { void getRuns().then(setRuns); }, []);

  const best = runs.length ? Math.max(...runs.map((run) => run.wpm)) : 0;
  const average = runs.length ? Math.round(runs.reduce((sum, run) => sum + run.wpm, 0) / runs.length) : 0;
  const keys: Record<string, { count: number; errors: number; latency: number }> = {};
  runs.forEach((run) => Object.entries(run.byKey).forEach(([key, value]) => {
    const row = keys[key] ?? { count: 0, errors: 0, latency: 0 };
    row.count += value.count;
    row.errors += value.errors;
    row.latency += value.latency * value.count;
    keys[key] = row;
  }));
  const keysInOrder = "1234567890qwertyuiopasdfghjkl;'zxcvbnm,./@#$%&+=".split("").concat("space");

  async function exportData() {
    const keyModel = await getWeakKeyModel();
    const preferences = { roundDurationSeconds: Number(localStorage.getItem("fingerfox-duration-v1")) || 60, appearance: localStorage.getItem("fingerfox-theme-v1") ?? "system", consentChoice: localStorage.getItem("fingerfox-consent-v1") };
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), runs, keyModel, preferences }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "fingerfox-data.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return <>
    <div className="page-heading">
      <p className="eyebrow">Private by default</p>
      <h1>Your practice, at a glance.</h1>
      <p>These stats are saved in this browser and are not synced to an account.</p>
    </div>
    <div className="stats-grid">
      <section className="panel stats-card"><p className="eyebrow">All-time best</p><h2>{best} <small>WPM</small></h2><p>Best correct words per minute</p></section>
      <section className="panel stats-card"><p className="eyebrow">Session average</p><h2>{average} <small>WPM</small></h2><p>{runs.length} {runs.length === 1 ? "session" : "sessions"} saved on this device</p></section>
    </div>
    <section className="panel stats-card" style={{ marginTop: 14 }}>
      <p className="eyebrow">Keyboard heatmap</p><h2>Keys to practice next</h2>
      <p>Colour is based on your recorded errors and average latency. Try more rounds to build a useful picture.</p>
      <div className="keyboard" aria-label="Keyboard practice heatmap">{keysInOrder.map((key) => {
        const value = keys[key];
        const ratio = value ? value.errors / value.count : 0;
        const tone = value && ratio < .12 ? "strong" : value && ratio > .28 ? "weak" : value ? "medium" : "";
        return <span key={key} className={`keycap ${tone} ${key === "space" ? "space-key" : ""}`} title={value ? `${Math.round(ratio * 100)}% errors, ${Math.round(value.latency / value.count)} ms average` : "No data yet"}>{key}</span>;
      })}</div>
      <div className="settings-row"><span className="text-green">Green outline: fewer errors</span><span className="text-yellow">Yellow outline: practice focus</span><span className="text-red">Red outline: more errors</span></div>
    </section>
    <section className="panel stats-card" style={{ marginTop: 14 }}>
      <div className="section-heading"><div><p className="eyebrow">Recent sessions</p><h2>Every round counts</h2></div><button className="button button-outline" onClick={() => void exportData()}>Export JSON</button></div>
      {runs.length ? runs.slice(0, 8).map((run) => <div className="settings-row" key={run.id}><span>{new Date(run.createdAt).toLocaleDateString()} · {run.game.replaceAll("-", " ")}{run.challengeDate ? " · daily" : ""}</span><span>{run.wpm} WPM · {run.accuracy}% accuracy · L{run.level ?? 1} · {run.difficulty ?? "Standard"}</span></div>) : <p>No sessions saved yet. <Link className="text-link" href="/games">Play your first game →</Link></p>}
    </section>
    <p className="game-help" style={{ marginTop: 18 }}>Run summaries and aggregated per-key metrics only. Raw keystroke logs are not saved.</p>
  </>;
}
