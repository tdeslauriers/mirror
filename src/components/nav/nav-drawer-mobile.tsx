"use client";

import { useEffect, useRef, useState } from "react";
import style from "./nav-drawer.module.css";
import modalStyle from "../modal.module.css";
import Modal from "../modal";
import MenuUser from "./menu-identity";
import { ShowMenu } from ".";
import MenuGallery from "./menu-gallery";
import MenuBlog from "./menu-blog";
import MenuTasks from "./menu-tasks";
import { useIdentity } from "../hooks/use-identity";

export default function MobileDrawer() {
  const { hasIdentity, render } = useIdentity();
  const [showMenu, setShowMenu] = useState(false);
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

  // persist submenu open/closed state on change
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
      setShowMenu(false);
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const toggleMenu = () => setShowMenu((previous) => !previous);
  const closeMenu = () => setShowMenu(false);

  const toggleSubmenu = (menu: string) =>
    setShowMenus((previous) => ({ ...previous, [menu]: !previous[menu] }));

  if (!hasIdentity) return null;

  return (
    <>
      {hasIdentity && (
        <>
          <button
            className={style.mobilebutton}
            onClick={toggleMenu}
            aria-expanded={showMenu}
          >
            Menu
          </button>

          <Modal
            className={modalStyle.drawer}
            isOpen={showMenu}
            onClose={closeMenu}
            label="Navigation"
          >
            <nav className={`${style.mobiledrawer}`}>
              {render.users && (
                <MenuUser
                  visible={showMenus}
                  render={render}
                  toggle={toggleSubmenu}
                  linkClick={closeMenu}
                />
              )}

              {render.gallery && (
                <MenuGallery
                  visible={showMenus}
                  render={render}
                  toggle={toggleSubmenu}
                  linkClick={closeMenu}
                />
              )}

              {render.blog && (
                <MenuBlog
                  visible={showMenus}
                  render={render}
                  toggle={toggleSubmenu}
                  linkClick={closeMenu}
                />
              )}

              {render.tasks && (
                <MenuTasks
                  visible={showMenus}
                  render={render}
                  toggle={toggleSubmenu}
                  linkClick={closeMenu}
                />
              )}
            </nav>
          </Modal>
        </>
      )}
    </>
  );
}
