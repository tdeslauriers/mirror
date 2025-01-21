"use client";

import styles from "./error-form.module.css";

export default function ErrorLoadPage({
  error,
  redirectUrl,
}: {
  error: string | null;
  redirectUrl: string | null;
}) {
  if (!error) {
    error =
      "An unknown error occurred.  Please try again. If the problem persists, please contact me.";
  }
  const handleRedirect = () => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      window.location.href = "/";
    }
  };
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
            <p>{error}</p>
          </div>
          <div className={styles.actionsError}>
            <button onClick={handleRedirect}>
              <strong>Try again, but better</strong>
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
