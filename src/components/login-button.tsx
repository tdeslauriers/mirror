import Link from "next/link";
import style from "./login-button.module.css";
import { cookies } from "next/headers";
import { logout } from "@/actions/logout";

export default async function LoginButton() {
  const cookieStore = await cookies();
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
                  <form className={style.logoutform} action={logout}>
                    <button className={style.logoutbutton}>Logout</button>
                  </form>
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
