"use client";

// clear browser-only state and notify other tabs.
export function broadcastLogout() {
  sessionStorage.clear();
  localStorage.setItem("logout", String(Date.now()));
  localStorage.removeItem("logout"); // clean up immediately
  window.dispatchEvent(new Event("identity-change"));
}
