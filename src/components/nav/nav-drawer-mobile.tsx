"use client";

import { useEffect, useState } from "react";
import style from "./nav-drawer.module.css";
import Modal from "../modal";
import Link from "next/link";

type Render = {
  user_read?: boolean;
  gallery_read?: boolean;
  blog_read?: boolean;
  task_read?: boolean;
  allowances_read?: boolean;
};

interface ShowMenu {
  [key: string]: boolean;
}

export default function MobileDrawer() {
  const [showMenu, setShowMenu] = useState(false);
  const [hasIdentity, setHasIdentity] = useState<boolean>(false);
  const [render, setRender] = useState<Render>({});
  const [showMenus, setShowMenus] = useState<ShowMenu>({});

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

    // run on mount to chack for identity cookie
    const identityCookie = getCookie("identity");
    if (identityCookie) {
      setHasIdentity(true);
      const identity = JSON.parse(decodeURIComponent(identityCookie));
      setRender(identity.ux_render);
    } else {
      setHasIdentity(false);
    }

    // run on storage change (cross-tab sync)
    window.addEventListener("storage", (e) => {
      if (e.key === "identity") {
        const identityCookie = getCookie("identity");
        if (identityCookie) {
          setHasIdentity(true);
          const identity = JSON.parse(decodeURIComponent(identityCookie));
          setRender(identity.ux_render);
        } else {
          setHasIdentity(false);
        }
      }
    });
  }, []);

  useEffect(() => {
    sessionStorage.setItem("drawerShowMenus", JSON.stringify(showMenus));
  }, [showMenus]);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const toggleSubmenu = (menu: string) => {
    setShowMenus((previous) => {
      return { ...previous, [menu]: !previous[menu] };
    });
  };

  const closeMenu = () => setShowMenu(false);

  return (
    <>
      {hasIdentity && (
        <>
          <button className={style.mobilebutton} onClick={toggleMenu}>
            Menu
          </button>

          <Modal isOpen={showMenu} onClose={closeMenu}>
            <>
              <div className={`${style.mobiledrawer} `}>
                {render && render.user_read && (
                  <div className={`${style.mobilesection}`}>
                    <button
                      className={`${style.menubutton}`}
                      onClick={() => toggleSubmenu("users")}
                    >
                      <strong>
                        <span
                          className={`${
                            showMenus["users"] ? "highlight" : "base"
                          }`}
                        >
                          Identity
                        </span>
                      </strong>
                    </button>
                    {showMenus["users"] && (
                      <div className={`${style.submenu}`}>
                        <ul>
                          <li>
                            <Link
                              className={`locallink`}
                              href={"/users"}
                              onClick={closeMenu}
                            >
                              Users
                            </Link>
                          </li>
                          <li>
                            <Link
                              className={`locallink`}
                              href={"/scopes"}
                              onClick={closeMenu}
                            >
                              Scopes
                            </Link>
                          </li>
                          <li>
                            <Link
                              className={`locallink`}
                              href={"/services"}
                              onClick={closeMenu}
                            >
                              Services
                            </Link>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {render && render.gallery_read && (
                  <div className={`${style.mobilesection}`}>
                    <button
                      className={`${style.menubutton}`}
                      onClick={() => toggleSubmenu("gallery")}
                    >
                      <strong>
                        <span
                          className={`${
                            showMenus["gallery"] ? "highlight" : "base"
                          }`}
                        >
                          Gallery
                        </span>
                      </strong>
                      {showMenus["gallery"] && (
                        <div className={`${style.submenu}`}>
                          <ul>
                            <li>
                              <span className={`highlight`}>Coming Soon!</span>
                            </li>
                          </ul>
                        </div>
                      )}
                    </button>
                  </div>
                )}
                {render && render.blog_read && (
                  <div className={`${style.mobilesection}`}>
                    <button
                      className={`${style.menubutton}`}
                      onClick={() => toggleSubmenu("blog")}
                    >
                      <strong>
                        <span
                          className={`${
                            showMenus["blog"] ? "highlight" : "base"
                          }`}
                        >
                          Blog
                        </span>
                      </strong>
                    </button>
                    {showMenus["blog"] && (
                      <div className={`${style.submenu}`}>
                        <ul>
                          <li>
                            <span className={`highlight`}>Coming Soon!</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {render && (render.task_read || render.allowances_read) && (
                  <div className={`${style.section}`}>
                    <button
                      className={`${style.menubutton}`}
                      onClick={() => toggleSubmenu("allowance")}
                    >
                      <strong>
                        <span
                          className={`${
                            showMenus["allowance"] ? "highlight" : "base"
                          }`}
                        >
                          Tasks
                        </span>
                      </strong>
                    </button>
                    {showMenus["allowance"] && (
                      <div className={`${style.submenu}`}>
                        <ul>
                          <li>
                            <Link className={`locallink`} href={"/allowances"}>
                              Allowances
                            </Link>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          </Modal>
        </>
      )}
    </>
  );
}
