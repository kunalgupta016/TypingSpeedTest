"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => setInstallEvent(null);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!installEvent) return null;
  const currentInstallEvent = installEvent;
  async function install() {
    await currentInstallEvent.prompt();
    await currentInstallEvent.userChoice;
    setInstallEvent(null);
  }
  return <aside className="install-prompt" aria-label="Install FingerFox">
    <div><strong>Keep FingerFox close</strong><p>Add this app to your home screen for quick access.</p></div>
    <button className="button button-outline" onClick={() => void install()}>Install</button>
    <button className="install-dismiss" aria-label="Dismiss install prompt" onClick={() => setInstallEvent(null)}>Not now</button>
  </aside>;
}
