"use client";

import { useEffect, useState } from "react";

import { UxRender } from "@/app/api";
import { getCookie } from "../client-cookies";

export function useIdentity() {
  const [hasIdentity, setHasIdentity] = useState(false);
  const [render, setRender] = useState<UxRender>({});

  useEffect(() => {
    function sync() {
      const cookie = getCookie("identity");
      if (!cookie) {
        setHasIdentity(false);
        setRender({});
        return;
      }
      try {
        const identity = JSON.parse(decodeURIComponent(cookie));
        setHasIdentity(true);
        setRender(identity.ux_render ?? {});
      } catch (e) {
        console.error("Failed to parse identity cookie:", e);
        setHasIdentity(false);
        setRender({});
      }
    }

    // run on mount
    sync();

    const onLogout = () => {
      setHasIdentity(false);
      setRender({});
    };

    // other tabs: storage events only fire in tabs that didn't write the key
    const onStorage = (event: StorageEvent) => {
      if (event.key === "logout") onLogout();
    };

    // this tab: storage events don't fire locally, so broadcastLogout()
    // dispatches this custom event to cover the tab that clicked logout
    window.addEventListener("storage", onStorage);
    window.addEventListener("identity-change", sync);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("identity-change", sync);
    };
  }, []);

  return { hasIdentity, render };
}
