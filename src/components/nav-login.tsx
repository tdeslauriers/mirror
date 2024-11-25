import Link from "next/link";
import style from "./nav-login.module.css";
import { cookies } from "next/headers";
import { logout } from "@/actions/logout";

export default async function NavLogin() {
  const cookieStore = await cookies();
  const hasIdentity = cookieStore.has("identity");

  return (
    <>
      {hasIdentity ? (
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
