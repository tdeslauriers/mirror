import styles from "./page.module.css";

export default function Login() {
  return (
    <>
      <header className={styles.header}>
        <h1>
          <span className={styles.highlight}>Login</span> to view restricted
          content.
        </h1>
      </header>
      <main className={styles.header}>
        <form className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="username">
                email
              </label>
              <input
                className={styles.form}
                type="text"
                id="username"
                name="username"
                required
              />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                Password
              </label>
              <input
                className={styles.form}
                type="password"
                id="password"
                name="password"
                required
              />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.actions}>
              <button>
                <strong>Login</strong>
              </button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
