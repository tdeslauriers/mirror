"use client";

import Link from "next/link";
import style from "./nav-main-header.module.css";
import { useIdentity } from "../hooks/use-identity";

export default function ExtendedNav() {
  const { hasIdentity } = useIdentity();

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
