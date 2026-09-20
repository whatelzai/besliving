"use client";
import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("sidebar-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("sidebar-change", callback);
  };
}

export function usePersistedCollapse(key: string) {
  const collapsed = useSyncExternalStore(subscribe, () => {
    try { return localStorage.getItem(key) === "true"; } catch { return false; }
  }, () => false);
  function toggle() {
    try { localStorage.setItem(key, String(!collapsed)); } catch { /* Storage can be disabled. */ }
    window.dispatchEvent(new Event("sidebar-change"));
  }
  return [collapsed, toggle] as const;
}
