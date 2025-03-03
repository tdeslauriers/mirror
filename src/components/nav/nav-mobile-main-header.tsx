"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import style from "./nav-main-header.module.css";
import ExtendedNav from "./nav-extended";

export default function MobileMenu() {
  const [showMenu, setShowMenu] = useState(false);
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

  const toggleMenu = () => {
    console.log("toggle menu");
    setShowMenu(!showMenu);
  };

  const closeMenu = () => setShowMenu(false);

  return (
    <>
      <div
        className={`${style.mobilemenu} ${
          showMenu ? `${style.menubuttonopen}` : ""
        }`}
      >
        <button onClick={toggleMenu}>
          <span className="highlight">☰</span>
        </button>
      </div>
      {showMenu && (
        <div className={style.menuopen}>
          <nav>
            <ul>
              <li>
                <Link className={style.locallink} href="/" onClick={closeMenu}>
                  des Lauriers World
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className={style.locallink}
                  onClick={closeMenu}
                >
                  About
                </Link>
              </li>
              {hasIdentity && (
                <>
                  <li>
                    <Link
                      className={style.locallink}
                      href="/privacy"
                      onClick={closeMenu}
                    >
                      Privacy Notice
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={style.locallink}
                      href="/faq"
                      onClick={closeMenu}
                    >
                      FAQ
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link
                  href="/resume"
                  className={style.locallink}
                  onClick={closeMenu}
                >
                  Résumé
                </Link>
              </li>
              <li>
                <Link
                  className={style.locallink}
                  href="https://www.github.com/tdeslauriers"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
