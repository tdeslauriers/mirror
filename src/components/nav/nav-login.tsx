"use client";

import style from "./nav-login.module.css";
import Link from "next/link";
import { logout } from "@/actions/logout";
import { useEffect, useState } from "react";

export default function NavLogin() {
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

    const identity = getCookie("identity");
    if (identity) {
      setHasIdentity(true);
    } else {
      setHasIdentity(false);
    }
  }, []);

  return (
    <>
      {hasIdentity ? (
        <>
          <div className={style.nav}>
            <ul>
              <li>
                <Link className={style.locallink} href="/profile">
                  Profile
                </Link>
              </li>
              <li>
                <form className={style.logoutform} action={logout}>
                  <button className={style.logoutbutton}>Logout</button>
                </form>
              </li>
            </ul>
          </div>
        </>
      ) : (
        <>
          <div className={style.nav}>
            <ul>
              <li>
                <Link className={style.locallink} href="/register">
                  Register
                </Link>
              </li>
              <li>
                <Link className={style.locallink} href="/login">
                  Login
                </Link>
              </li>
            </ul>
          </div>
        </>
      )}
    </>
  );
}
