"use client";
import { useEffect, useState } from "react";
import style from "./nav-drawer.module.css";

type Render = {
  user_read?: boolean;
  gallery_read?: boolean;
  blog_read?: boolean;
  task_read?: boolean;
  payroll_read?: boolean;
};

export default function NavDrawer() {
  const [hasIdentity, setHasIdentity] = useState<boolean>(false);
  const [render, setRender] = useState<Render>({});

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

  return (
    <>
      {hasIdentity ? (
        <>
          <div className={`${style.drawer} `}>
            {render && render.user_read && (
              <div className={`${style.section}`}>User Administration</div>
            )}
            {render && render.gallery_read && (
              <div className={`${style.section}`}>
                Gallery{" "}
                <sup>
                  <span className={`highlight ${style.annotation}`}>
                    Coming Soon!
                  </span>
                </sup>
              </div>
            )}
            {render && render.blog_read && (
              <div className={`${style.section}`}>
                Blog{" "}
                <sup>
                  <span className={`highlight ${style.annotation}`}>
                    Coming Soon!
                  </span>
                </sup>
              </div>
            )}
            {render && (render.task_read || render.payroll_read) && (
              <div className={`${style.section}`}>
                Allowance{" "}
                <sup>
                  <span className={`highlight ${style.annotation}`}>
                    Coming Soon!
                  </span>
                </sup>
              </div>
            )}
          </div>
        </>
      ) : null}
    </>
  );
}
