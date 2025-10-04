import Link from "next/link";
import styles from "./error-authentication.module.css";

export default function AuthError() {
  return (
    <>
      <main className={styles.main}>
        <div className={styles.error}>
          <h2>
            <span className={styles.highlightError}>Authentication Error</span>
          </h2>
          <div className={styles.center}>
            <p>
              There was an error with the authentication process. Honestly,
              I&apos;m not surprised. You would not believe all that goes into
              this.
              <br />
              <br />
              Please try{" "}
              <Link className={styles.locallink} href={"/login"}>
                logging in
              </Link>{" "}
              in again. If the problem persists, contact me.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
