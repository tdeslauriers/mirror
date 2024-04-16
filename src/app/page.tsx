import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <main className={styles.main}>
        <div>
          <h2>
            Welcome to{" "}
            <span className={styles.highlight}>
              <strong>des Lauriers</strong>
            </span>{" "}
            world.
          </h2>
          <div className={styles.center}>
            <p>
              This is where you can find out what we are up to. It includes our
              photo gallery, some art work, and I am adding to it all the time!
              The site itself is a hobby project, sort of. To find out more,
              checkout the{" "}
              <Link className={styles.locallink} href={"/about"}>
                about
              </Link>{" "}
              page.
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
