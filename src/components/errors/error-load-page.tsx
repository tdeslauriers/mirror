"use client";

import styles from "./error-load-page.module.css";

export default function ErrorLoadPage({
  errBanner,
  errMsg,
  redirectUrl,
}: {
  errBanner?: string | null;
  errMsg?: string | null;
  redirectUrl?: string | null;
}) {
  if (!errMsg) {
    errMsg =
      "An unknown error occurred.  Please try again. If the problem persists, please contact me.";
  }
  const handleRedirect = () => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      window.location.href = "/";
    }
  };

  const buttonLable = redirectUrl ? `Go to ${redirectUrl.slice(1)}` : "Go home";
  return (
    <>
      <main className={`main main-drawer`}>
        <div className="center"></div>
        <div className={styles.error}>
          <h2>
            <span className={styles.highlightError}>
              {errBanner ? errBanner : "Well, that didn't work..."}
            </span>
          </h2>

          <div className={styles.message}>
            <p>{errMsg ? errMsg : "Something has gone terribly wrong."}</p>
          </div>

          <div className={styles.actionsError}>
            <button onClick={handleRedirect}>
              <strong>{buttonLable}</strong>
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
