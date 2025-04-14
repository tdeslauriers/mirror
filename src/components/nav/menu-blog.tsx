"use client";

import style from "./nav-drawer.module.css";
import { UxRender } from "@/app/api";
import { ShowMenu } from ".";

export default function MenuBlog({
  visible,
  render,
  toggle,
  linkClick,
}: {
  visible: ShowMenu;
  render: UxRender | undefined;
  toggle: (menu: string) => void;
  linkClick?: () => void | undefined;
}) {
  return (
    <>
      <div className={`${style.section}`}>
        <button
          className={`${style.menubutton}`}
          onClick={() => toggle("blog")}
        >
          <strong>
            <span className={`${visible["blog"] ? "highlight" : "base"}`}>
              Blog
            </span>
          </strong>
        </button>
        {visible["blog"] && (
          <div className={`${style.submenu}`}>
            <ul>
              <li>
                <span className={`highlight`}>Coming Soon!</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
