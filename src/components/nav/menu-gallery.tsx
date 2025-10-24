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
              {/* add image */}
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

              {/* add album */}
              {render && render.gallery?.album_write && (
                <li>
                  <Link
                    className={`locallink`}
                    href={"/albums/add"}
                    onClick={linkClick}
                  >
                    Add Album
                  </Link>
                </li>
              )}

              {/* staged - only show if user has both album read and image write permissions
               because only exists to update images which failed pipeline processing */}
              {render &&
                render.gallery?.album_read &&
                render.gallery?.image_write && (
                  <li>
                    <Link
                      className={`locallink`}
                      href={"/albums/staged"}
                      onClick={linkClick}
                    >
                      staged
                    </Link>
                  </li>
                )}

              {/* albums */}
              {render && render.gallery?.album_read && (
                <li>
                  <Link
                    className={`locallink`}
                    href={"/albums"}
                    onClick={linkClick}
                  >
                    Albums
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
