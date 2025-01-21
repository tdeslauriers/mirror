import Link from "next/link";
import Image from "next/image";
import logo256 from "@/assets/logo_world_2_256.png";
import style from "./nav-main-header.module.css";
import NavLogin from "./nav-login";
import { cookies } from "next/headers";
import NavDrawer from "./nav-drawer";

export default async function NavMainHeader() {
  const cookieStore = await cookies();
  const hasIdentity = cookieStore.has("identity")
    ? cookieStore.get("identity")
    : null;
  return (
    <>
      <header className={style.header}>
        <div className={style.left}>
          <Link className={style.logo} href="/">
            <Image src={logo256} alt="Laurels Logo" />
            <span className={style.locallink}>des Lauriers world</span>{" "}
          </Link>

          <nav className={style.nav}>
            <ul>
              <li>
                <Link href="/about" className={style.locallink}>
                  About
                </Link>
              </li>
              <li>
                <Link
                  className={style.locallink}
                  href="https://www.github.com/tdeslauriers"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <NavLogin />

        <NavDrawer />
      </header>
    </>
  );
}
