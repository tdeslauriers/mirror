"use client";

import Link from "next/link";
import { useState } from "react";
import style from "./nav-main-header.module.css";
import loginStyle from "./nav-login.module.css";
import Modal from "../modal";
import { logout } from "@/actions/logout";

import { useIdentity } from "../hooks/use-identity";
import { broadcastLogout } from "../logout-broadcast";

export default function MobileMenu() {
  const { hasIdentity } = useIdentity();
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => setShowMenu((previous) => !previous);
  const closeMenu = () => setShowMenu(false);

  return (
    <>
      <div
        className={`${style.mobilemenu} ${showMenu ? style.menubuttonopen : ""}`}
      >
        <button onClick={toggleMenu}>
          <span className="highlight">☰</span>
        </button>
      </div>

      <Modal isOpen={showMenu} onClose={closeMenu} label="Main menu">
        <nav>
          <ul className={style.mobilenavlist}>
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

            <li role="presentation">
              <hr />
            </li>

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
                    onSubmit={broadcastLogout}
                  >
                    <button
                      className={loginStyle.logoutbutton}
                      onClick={closeMenu}
                    >
                      Logout
                    </button>
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
