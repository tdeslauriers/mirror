// lib/logout-broadcast.ts
"use client";

/** Clear browser-only state and notify other tabs. The server action
 *  clears cookies server-side and redirects; don't preventDefault. */
export function broadcastLogout() {
  sessionStorage.clear();
  localStorage.setItem("logout", String(Date.now()));
  window.dispatchEvent(new Event("identity-change"));
}
