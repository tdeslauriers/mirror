import Link from "next/link";
import Image from "next/image";
import logo256 from "@/assets/logo_world_2_256.png";
import style from "./nav-main-header.module.css";
import NavLogin from "./nav-login";
import NavDrawer from "./nav-drawer";
import ExtendedNav from "./nav-extended";
import MobileMenu from "./nav-main-header-mobile";
import MobileDrawer from "./nav-drawer-mobile";

export default async function NavMainHeader() {
  return (
    <>
      <header className={style.header}>
        <div className={style.left}>
          <Link className={style.logo} href="/">
            <Image src={logo256} alt="Laurels Logo" />
          </Link>

          {/* mobile nav menu */}
          <div className={style.mobilenav}>
            <MobileMenu />
          </div>

          <nav className={style.nav}>
            <ul>
              <li>
                <Link className={style.locallink} href="/">
                  des Lauriers world
                </Link>
              </li>
              <li>
                <Link href="/about" className={style.locallink}>
                  About
                </Link>
              </li>
              <ExtendedNav />
              <li>
                <Link href="/resume" className={style.locallink}>
                  Résumé
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

        <div className={style.right}>
          <NavLogin />
        </div>

        {/* mobile drawer */}
        <div className={style.mobiledrawer}>
          <MobileDrawer />
        </div>

        <NavDrawer />
      </header>
    </>
  );
}
