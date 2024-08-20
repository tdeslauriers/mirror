
import Link from "next/link";
import style from "./login-button.module.css";
import { cookies } from "next/headers";

export default function LoginButton() {
  const cookieStore = cookies();
  const hasAuthenticated = cookieStore.has("authenticated")
    ? cookieStore.get("authenticated")
    : null;

  return (
    <>
      {hasAuthenticated && hasAuthenticated.value === "true" ? (
        <>
          <div className={style.right}>
            <div className={style.nav}>
              <ul>
                <li>
                  <Link className={style.locallink} href="/profile">
                    Profile
                  </Link>
                </li>
                <li>
                  <Link className={style.locallink} href="/logout">
                    Logout
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={style.right}>
            <div className={style.nav}>
              <ul>
                <li>
                  <Link className={style.locallink} href="/register">
                    Register
                  </Link>
                </li>
                <li>
                  <Link className={style.locallink} href="/login">
                    Login
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </>
  );
}
