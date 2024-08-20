process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import Link from "next/link";
import styles from "./page.module.css";
import { cookies } from "next/headers";
import Welcome from "@/components/welcome";

export default async function Home() {
  const cookieStore = cookies();
  const hasAuthenticated = cookieStore.has("authenticated")
    ? cookieStore.get("authenticated")
    : null;

  return (
    <>
      <main className={styles.main}>
        <div>
          <Welcome />
          <div className={styles.center}>
            <p>
              Freatures our photo gallery, some art work, and I am adding to it
              all the time! The site itself is a hobby project, sort of. To find
              out more, check out the{" "}
              <Link className={styles.locallink} href={"/about"}>
                about
              </Link>{" "}
              page.
              {hasAuthenticated && hasAuthenticated.value === "true" ? null : (
                <>
                  <br />
                  <br />
                  For most content, you will need to{" "}
                  <Link className={styles.locallink} href={"/register"}>
                    create an account
                  </Link>
                  . If you already have one,{" "}
                  <Link className={styles.locallink} href={"/login"}>
                    login
                  </Link>
                  !
                </>
              )}
            </p>
          </div>
          <p style={{ fontStyle: "italic" }}>
            Designed, deployed, and administered by{" "}
            <span className={styles.highlight}>Tom des Lauriers</span>.
          </p>
        </div>
      </main>
    </>
  );
}
