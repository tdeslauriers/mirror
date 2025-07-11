"use client";

import { useEffect, useState } from "react";
import style from "./nav-drawer.module.css";
import { UxRender } from "@/app/api";
import MenuUser from "./menu-identity";
import { ShowMenu } from ".";
import MenuGallery from "./menu-gallery";
import MenuBlog from "./menu-blog";
import MenuTasks from "./menu-tasks";

export default function NavDrawer() {
  const [hasIdentity, setHasIdentity] = useState<boolean>(false);
  const [render, setRender] = useState<UxRender>({});
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
