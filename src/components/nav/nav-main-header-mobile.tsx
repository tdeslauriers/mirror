"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import style from "./nav-main-header.module.css";
import loginStyle from "./nav-login.module.css";
import Modal from "../modal";
import { logout } from "@/actions/logout";

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
    setShowMenu(!showMenu);
  };

  const closeMenu = () => setShowMenu(false);

  return (
    <>
      <div className={style.mobilemenu}>
        <button onClick={toggleMenu}>
          <span className="highlight">☰</span>
        </button>
      </div>

      <Modal isOpen={showMenu} onClose={closeMenu}>
        <nav>
          <ul>
            <li>
              <Link className={style.locallink} href="/" onClick={closeMenu}>
                Home
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
                    Privacy
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

            <hr />

            {hasIdentity ? (
              <>
                <li>
                  <Link
                    className={style.locallink}
                    href="/profile"
                    onClick={closeMenu}
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <form
                    className={loginStyle.logoutform}
                    action={logout}
                    method="post"
                  >
                    <button className={loginStyle.logoutbutton}>Logout</button>
                  </form>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    className={style.locallink}
                    href="/register"
                    onClick={closeMenu}
                  >
                    Register
                  </Link>
                </li>
                <li>
                  <Link
                    className={style.locallink}
                    href="/login"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </Modal>
    </>
  );
}
