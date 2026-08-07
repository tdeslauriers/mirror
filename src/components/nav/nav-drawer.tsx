"use client";

import style from "./nav-drawer.module.css";
import { useEffect, useRef, useState } from "react";
import MenuUser from "./menu-identity";
import { ShowMenu } from ".";
import MenuGallery from "./menu-gallery";
import MenuBlog from "./menu-blog";
import MenuTasks from "./menu-tasks";
import { useIdentity } from "../hooks/use-identity";

export default function NavDrawer() {
  const { hasIdentity, render } = useIdentity();
  const [showMenus, setShowMenus] = useState<ShowMenu>({});
  const hydrated = useRef(false);

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

  // persist submenu open/closed state on change (skipping the initial mount)
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    sessionStorage.setItem("drawerShowMenus", JSON.stringify(showMenus));
  }, [showMenus]);

  // drawer-specific reaction to cross-tab logout broadcast
  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key !== "logout") return;
      sessionStorage.clear();
      setShowMenus({});
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const toggleMenu = (menu: string) =>
    setShowMenus((previous) => ({ ...previous, [menu]: !previous[menu] }));

  if (!hasIdentity) return null;

  return (
    <>
      {hasIdentity ? (
        <>
          <div className={`${style.drawer} `}>
            {render.users && (
              <MenuUser
                visible={showMenus}
                render={render}
                toggle={toggleMenu}
              />
            )}

            {render.gallery && (
              <MenuGallery
                visible={showMenus}
                render={render}
                toggle={toggleMenu}
              />
            )}

            {render.blog && (
              <MenuBlog
                visible={showMenus}
                render={render}
                toggle={toggleMenu}
              />
            )}

            {render.tasks && (
              <MenuTasks
                visible={showMenus}
                render={render}
                toggle={toggleMenu}
              />
            )}
          </div>
        </>
      ) : null}
    </>
  );
}
