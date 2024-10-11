"use client";

import styles from "./page.module.css";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <main className={styles.main}>
        <div className={styles.error}>
          <h2>
            <span className={styles.highlightError}>
              Well, that didnt work...
            </span>
          </h2>

          <div className={styles.center}>
            <p>{error.message}</p>
          </div>
          <div className={styles.actionsError}>
            <button onClick={reset}>Try again, but better</button>
          </div>
        </div>
      </main>
    </>
  );
}
