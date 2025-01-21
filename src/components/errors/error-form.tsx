"use client";

import styles from "./error-form.module.css";

export default function ErrorForm({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <main className={styles.center}>
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
            <button onClick={reset}><strong>Try again, but better</strong></button>
          </div>
        </div>
      </main>
    </>
  );
}
