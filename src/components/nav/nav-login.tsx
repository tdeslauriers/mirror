"use client";

import style from "./nav-login.module.css";
import Link from "next/link";
import { logout } from "@/actions/logout";
import { useIdentity } from "../hooks/use-identity";
import { broadcastLogout } from "../logout-broadcast";

export default function NavLogin() {
  const { hasIdentity } = useIdentity();

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
                <form
                  className={style.logoutform}
                  action={logout}
                  onSubmit={broadcastLogout}
                >
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
