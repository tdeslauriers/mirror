import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo512.png";
import style from "./main-header.module.css";

export default function MainHeader(): React.ReactElement {
  return (
    <header className={style.header}>
      <div className={style.left}>
        <Link className={style.logo} href="/">
          <Image src={logo} alt="Laurels Logo" />
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
    </header>
  );
}
