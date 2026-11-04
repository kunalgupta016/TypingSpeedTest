"use client";

import { useEffect, useRef } from "react";

type ThemePreference = "system" | "light" | "dark";
const themeKey = "fingerfox-theme-v1";

export function ThemeControl() {
  const selectRef = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    const saved = localStorage.getItem(themeKey);
    if (saved === "light" || saved === "dark" || saved === "system") selectRef.current!.value = saved;
    document.documentElement.dataset.theme = saved ?? "system";
    const reset = () => { if (selectRef.current) selectRef.current.value = "system"; };
    window.addEventListener("fingerfox-theme-reset", reset);
    return () => window.removeEventListener("fingerfox-theme-reset", reset);
  }, []);
  function changeTheme(value: ThemePreference) {
    localStorage.setItem(themeKey, value);
    document.documentElement.dataset.theme = value;
  }
  return <div className="settings-row">
    <div><label htmlFor="theme-preference">Appearance</label><p className="setting-hint">Choose a theme or follow your device.</p></div>
    <select ref={selectRef} id="theme-preference" className="tier-select" defaultValue="system" onChange={(event) => changeTheme(event.currentTarget.value as ThemePreference)}>
      <option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option>
    </select>
  </div>;
}
