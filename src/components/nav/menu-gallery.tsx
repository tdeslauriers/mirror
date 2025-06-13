"use client";

import style from "./nav-drawer.module.css";
import { UxRender } from "@/app/api";
import { ShowMenu } from ".";
import Link from "next/link";

export default function MenuGallery({
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
          onClick={() => toggle("gallery")}
        >
          <strong>
            <span className={`${visible["gallery"] ? "highlight" : "base"}`}>
              Gallery
            </span>
          </strong>
        </button>
        {visible["gallery"] && (
          <div className={`${style.submenu}`}>
            <ul>
              {render && render.gallery?.image_write && (
                <li>
                  <Link
                    className={`locallink`}
                    href={"/images/add"}
                    onClick={linkClick}
                  >
                    Add Image
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
