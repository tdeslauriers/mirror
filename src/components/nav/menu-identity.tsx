"use client";

import style from "./nav-drawer.module.css";
import Link from "next/link";
import { UxRender } from "@/app/api";
import { ShowMenu } from ".";

export default function MenuUser({
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
          onClick={() => toggle("users")}
        >
          <strong>
            <span className={`${visible["users"] ? "highlight" : "base"}`}>
              Identity
            </span>
          </strong>
        </button>
        {visible["users"] && (
          <div className={`${style.submenu}`}>
            <ul>
              {render && render.users?.user_read && (
                <li>
                  <Link
                    className={`locallink`}
                    href={"/permissions"}
                    onClick={linkClick}
                  >
                    Permissions
                  </Link>
                </li>
              )}

              {render && render.users?.scope_read && (
                <li>
                  <Link
                    className={`locallink`}
                    href={"/scopes"}
                    onClick={linkClick}
                  >
                    Scopes
                  </Link>
                </li>
              )}

              {render && render.users?.client_read && (
                <li>
                  <Link
                    className={`locallink`}
                    href={"/services"}
                    onClick={linkClick}
                  >
                    Services
                  </Link>
                </li>
              )}

              {render && render.users?.user_read && (
                <li>
                  <Link
                    className={`locallink`}
                    href={"/users"}
                    onClick={linkClick}
                  >
                    Users
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
