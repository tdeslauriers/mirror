"use client";

import { useEffect, useState } from "react";
import style from "./nav-drawer.module.css";
import { UxRender } from "@/app/api";
import MenuUser from "./menu-identity";
import { ShowMenu } from ".";
import MenuGallery from "./menu-gallery";
import MenuBlog from "./menu-blog";
import MenuTasks from "./menu-tasks";

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

export default function NavDrawer() {
  const [hasIdentity, setHasIdentity] = useState<boolean>(false);
  const [render, setRender] = useState<UxRender>({});
  const [showMenus, setShowMenus] = useState<ShowMenu>({});

  useEffect(() => {
    function syncIdentity() {
      const identityCookie = getCookie("identity");
      if (!identityCookie) {
        setHasIdentity(false);
        setRender({});
        return;
      }

      try {
        const identityData = JSON.parse(decodeURIComponent(identityCookie));
        setHasIdentity(true);
        setRender(identityData.ux_render || {});
      } catch (error) {
        console.error("Failed to parse identity cookie:", error);
        setHasIdentity(false);
        setRender({});
      }
    }

    // run on mount
    syncIdentity();

    // run on cross-tab logout broadcast
    const handler = (event: StorageEvent) => {
      if (event.key === "logout") {
        sessionStorage.clear();
        setShowMenus({});
        syncIdentity();
      }
    };

    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener("storage", handler);
    };
  }, []);

  // hydrate the drawer open/closed state from sessionStorage on mount
  useEffect(() => {
    const sessionShowMenus = sessionStorage.getItem("drawerShowMenus");
    if (!sessionShowMenus) {
      return;
    }

    try {
      setShowMenus(JSON.parse(sessionShowMenus));
    } catch (error) {
      console.error(
        "Failed to parse drawerShowMenus from sessionStorage:",
        error,
      );
    }
  }, []);

  // persist the drawer open/closed state to sessionStorage on change
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
            {render && render.users && (
              <MenuUser
                visible={showMenus}
                render={render}
                toggle={toggleMenu}
              />
            )}

            {render && render.gallery && (
              <MenuGallery
                visible={showMenus}
                render={render}
                toggle={toggleMenu}
              />
            )}

            {render && render.blog && (
              <MenuBlog
                visible={showMenus}
                render={render}
                toggle={toggleMenu}
              />
            )}

            {render && render.tasks && (
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
