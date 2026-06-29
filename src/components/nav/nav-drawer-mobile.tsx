"use client";

import { useEffect, useState } from "react";
import style from "./nav-drawer.module.css";
import Modal from "../modal";
import MenuUser from "./menu-identity";
import { UxRender } from "@/app/api";
import { ShowMenu } from ".";
import MenuGallery from "./menu-gallery";
import MenuBlog from "./menu-blog";
import MenuTasks from "./menu-tasks";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

export default function MobileDrawer() {
  const [showMenu, setShowMenu] = useState(false);
  const [hasIdentity, setHasIdentity] = useState<boolean>(false);
  const [render, setRender] = useState<UxRender>({});
  const [showMenus, setShowMenus] = useState<ShowMenu>({});

  // read identity cookie on mount; re-read on cross-tab logout broadcast
  useEffect(() => {
    function syncIdentity() {
      const identityCookie = getCookie("identity");
      if (!identityCookie) {
        setHasIdentity(false);
        setRender({});
        return;
      }

      try {
        const identity = JSON.parse(decodeURIComponent(identityCookie));
        setHasIdentity(true);
        setRender(identity.ux_render ?? {});
      } catch (e) {
        console.error("Failed to parse identity cookie:", e);
        setHasIdentity(false);
        setRender({});
      }
    }

    // run on mount
    syncIdentity();

    // run on mount to chack for identity cookie
    const identityCookie = getCookie("identity");
    if (identityCookie) {
      setHasIdentity(true);
      const identity = JSON.parse(decodeURIComponent(identityCookie));
      setRender(identity.ux_render);
    } else {
      setHasIdentity(false);
    }

    // run on cross-tab logout broadcast
    const handler = (event: StorageEvent) => {
      if (event.key === "logout") {
        sessionStorage.clear();
        setShowMenus({});
        setShowMenu(false);
        syncIdentity();
      }
    };

    window.addEventListener("storage", handler);

    return () => window.removeEventListener("storage", handler);
  }, []);

  // hydrate submenu open/closed state from sessionStorage on mount
  useEffect(() => {
    const sessionShowMenus = sessionStorage.getItem("drawerShowMenus");
    if (!sessionShowMenus) return;

    try {
      setShowMenus(JSON.parse(sessionShowMenus));
    } catch (e) {
      console.error("Failed to parse drawerShowMenus from sessionStorage:", e);
    }
  }, []);

  // persist submenu open/closed state on change
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
                {render && render.users && (
                  <MenuUser
                    visible={showMenus}
                    render={render}
                    toggle={toggleSubmenu}
                    linkClick={closeMenu}
                  />
                )}

                {render && render.gallery && (
                  <MenuGallery
                    visible={showMenus}
                    render={render}
                    toggle={toggleSubmenu}
                    linkClick={closeMenu}
                  />
                )}

                {render && render.blog && (
                  <MenuBlog
                    visible={showMenus}
                    render={render}
                    toggle={toggleSubmenu}
                    linkClick={closeMenu}
                  />
                )}

                {render && render.tasks && (
                  <MenuTasks
                    visible={showMenus}
                    render={render}
                    toggle={toggleSubmenu}
                    linkClick={closeMenu}
                  />
                )}
              </div>
            </>
          </Modal>
        </>
      )}
    </>
  );
}
