"use client";
import { useEffect, useState } from "react";
import style from "./nav-drawer.module.css";

export default function NavDrawer() {
  const [hasIdentity, setHasIdentity] = useState<boolean>(false);

  useEffect(() => {
    function getCookie(name: string): string | null {
      if (typeof document === "undefined") {
        // If document is not available, return null or handle as needed
        return null;
      }

      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(";").shift() || null;
      }
      return null;
    }

    const identityCookie = getCookie("identity");
    if (identityCookie) {
      setHasIdentity(true);
      const identity = JSON.parse(decodeURIComponent(identityCookie));
       // TODO: pass ux render to drawer to render link buttons.
    } else {
      setHasIdentity(false);
    }
  }, []);

  return (
    <>
      {hasIdentity ? (
        <>
          <div className={`${style.drawer} `}>
            <div>User Administration</div>
            <div className={style.flex}>Blog</div>
            <div>Allowance</div>
            <div>Gallery</div>
          </div>
        </>
      ) : null}
    </>
  );
}
