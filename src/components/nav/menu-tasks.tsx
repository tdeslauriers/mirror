"use client";

import style from "./nav-drawer.module.css";
import Link from "next/link";
import { UxRender } from "@/app/api";
import { ShowMenu } from ".";

export default function MenuTasks({
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
          onClick={() => toggle("tasks")}
        >
          <strong>
            <span className={`${visible["tasks"] ? "highlight" : "base"}`}>
              Tasks
            </span>
          </strong>
        </button>
        {visible["tasks"] && (
          <div className={`${style.submenu}`}>
            <ul>
              {render && render.tasks?.allowances_read && (
                <li>
                  <Link
                    className={`locallink`}
                    href={"/allowances/account"}
                    onClick={linkClick}
                  >
                    Allowance
                  </Link>
                </li>
              )}

              {render && render.tasks?.allowances_write && (
                <li>
                  <Link
                    className={`locallink`}
                    href={"/allowances"}
                    onClick={linkClick}
                  >
                    Allowances
                  </Link>
                </li>
              )}
              {render && render.tasks?.templates_read && (
                <li>
                  <Link
                    className={`locallink`}
                    href={"/templates"}
                    onClick={linkClick}
                  >
                    Task Templates
                  </Link>
                </li>
              )}

              {render && render.tasks?.allowances_write && (
                <li>
                  <Link
                    className={`locallink`}
                    href={"/tasks?view=today"}
                    onClick={linkClick}
                  >
                    Today: All Tasks
                  </Link>
                </li>
              )}

              {render && render.tasks?.tasks_read && (
                <li>
                  <Link
                    className={`locallink`}
                    href={"/tasks?view=today&assignee=me"}
                    onClick={linkClick}
                  >
                    Today: My Tasks
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
