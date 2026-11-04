"use client";

const DB_NAME = "fingerfox-local";
const STORE = "runs";
const KEYS = "keys";

export type SavedRun = {
  id: string;
  game: string;
  wpm: number;
  accuracy: number;
  raw: number;
  errors: number;
  duration: number;
  createdAt: number;
  byKey: Record<string, { latency: number; errors: number; count: number }>;
  score?: number;
  level?: number;
  difficulty?: "easy" | "standard" | "hard";
  challengeDate?: string;
};

type KeyStat = { key: string; latency: number; errorRate: number; samples: number };

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: "id" });
      if (!request.result.objectStoreNames.contains(KEYS)) request.result.createObjectStore(KEYS, { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveRun(run: SavedRun) {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE, KEYS], "readwrite");
    tx.objectStore(STORE).put(run);
    const keyStore = tx.objectStore(KEYS);
    Object.entries(run.byKey).forEach(([key, value]) => {
      const request = keyStore.get(key);
      request.onsuccess = () => {
        const previous = request.result as KeyStat | undefined;
        const errorRate = value.errors / Math.max(1, value.count);
        const next: KeyStat = previous
          ? {
              key,
              latency: previous.latency * 0.8 + value.latency * 0.2,
              errorRate: previous.errorRate * 0.8 + errorRate * 0.2,
              samples: previous.samples + value.count,
            }
          : { key, latency: value.latency, errorRate, samples: value.count };
        keyStore.put(next);
      };
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getRuns(): Promise<SavedRun[]> {
  if (typeof indexedDB === "undefined") return [];
  const db = await openDb();
  const rows = await new Promise<SavedRun[]>((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return rows.sort((a, b) => b.createdAt - a.createdAt);
}

export async function clearRuns() {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE, KEYS], "readwrite");
    tx.objectStore(STORE).clear();
    tx.objectStore(KEYS).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getWeakKeyWeights(): Promise<Record<string, number>> {
  const model = await getWeakKeyModel();
  return Object.fromEntries(Object.entries(model).map(([key, row]) => [key, Math.min(3, row.errorRate * 2 + row.latency / 1500)]));
}

export async function getWeakKeyModel(): Promise<Record<string, { latency: number; errorRate: number; samples: number }>> {
  if (typeof indexedDB === "undefined") return {};
  const db = await openDb();
  const rows = await new Promise<KeyStat[]>((resolve, reject) => {
    const request = db.transaction(KEYS).objectStore(KEYS).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return Object.fromEntries(rows.map(({ key, latency, errorRate, samples }) => [key, { latency, errorRate, samples }]));
}
