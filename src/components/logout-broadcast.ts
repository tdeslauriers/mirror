"use client";

// clear browser-only state and notify other tabs. 
export function broadcastLogout() {
  sessionStorage.clear();
  localStorage.setItem("logout", String(Date.now()));
  window.dispatchEvent(new Event("identity-change"));
}
