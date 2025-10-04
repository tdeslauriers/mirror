"use client";
import Link from "next/link";
import style from "./nav-main-header.module.css";
import { useEffect, useState } from "react";

export default function ExtendedNav() {
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
    } else {
      setHasIdentity(false);
    }
  }, []);

  return (
    <>
      {hasIdentity && (
        <>
          <li>
            <Link className={style.locallink} href="/privacy">
              Privacy
            </Link>
          </li>
          <li>
            <Link className={style.locallink} href="/faq">
              FAQ
            </Link>
          </li>
        </>
      )}
    </>
  );
}
