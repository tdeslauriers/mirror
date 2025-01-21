"use client";
import { useEffect, useState } from "react";
import style from "./nav-drawer.module.css";
import Link from "next/link";

type Render = {
  user_read?: boolean;
  gallery_read?: boolean;
  blog_read?: boolean;
  task_read?: boolean;
  payroll_read?: boolean;
};

interface ShowMenu {
  [key: string]: boolean;
}

export default function NavDrawer() {
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

    const identityCookie = getCookie("identity");
    if (identityCookie) {
      setHasIdentity(true);
      const identity = JSON.parse(decodeURIComponent(identityCookie));
      setRender(identity.ux_render);
    } else {
      setHasIdentity(false);
    }
  }, []);

  useEffect(() => {
    const sessionShowMenus = sessionStorage.getItem("drawerShowMenus");
    if (sessionShowMenus) {
      setShowMenus(JSON.parse(sessionShowMenus));
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("drawerShowMenus", JSON.stringify(showMenus));
  }, [showMenus]);

  const toggleMenu = (menu: string) => {
    setShowMenus((previous) => {
      return { ...previous, [menu]: !previous[menu] };
    });
  };

  return (
    <>
      {hasIdentity ? (
        <>
          <div className={`${style.drawer} `}>
            {render && render.user_read && (
              <div className={`${style.section}`}>
                <button
                  className={`${style.menubutton}`}
                  onClick={() => toggleMenu("usres")}
                >
                  <strong>
                    <span
                      className={`${showMenus["usres"] ? "highlight" : "base"}`}
                    >
                      Identity
                    </span>
                  </strong>
                </button>
                {showMenus["usres"] && (
                  <ul className={`${style.submenu}`}>
                    <li>
                      <Link className={`locallink`} href={"/users"}>
                        Users
                      </Link>
                    </li>
                    <li>
                      <Link className={`locallink`} href={"/scopes"}>
                        Scopes
                      </Link>
                    </li>
                  </ul>
                )}
              </div>
            )}
            {render && render.gallery_read && (
              <div className={`${style.section}`}>
                <button
                  className={`${style.menubutton}`}
                  onClick={() => toggleMenu("gallery")}
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
                    <div>
                      <ul className={`${style.submenu}`}>
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
              <div className={`${style.section}`}>
                <button
                  className={`${style.menubutton}`}
                  onClick={() => toggleMenu("blog")}
                >
                  <strong>
                    <span
                      className={`${showMenus["blog"] ? "highlight" : "base"}`}
                    >
                      Blog
                    </span>
                  </strong>
                </button>
                {showMenus["blog"] && (
                  <div>
                    <ul className={`${style.submenu}`}>
                      <li>
                        <span className={`highlight`}>Coming Soon!</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
            {render && (render.task_read || render.payroll_read) && (
              <div className={`${style.section}`}>
                <button
                  className={`${style.menubutton}`}
                  onClick={() => toggleMenu("allowance")}
                >
                  <strong>
                    <span
                      className={`${
                        showMenus["allowance"] ? "highlight" : "base"
                      }`}
                    >
                      Allowance
                    </span>
                  </strong>
                </button>
                {showMenus["allowance"] && (
                  <div>
                    <ul className={`${style.submenu}`}>
                      <li>
                        <span className={`highlight`}>Coming Soon!</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : null}
    </>
  );
}
