process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import Login from "./login";
import styles from "./page.module.css";

export default async function LoginPage() {
  return (
    <>
      <header className={styles.header}>
        <h1>
          <span className={styles.highlight}>Login</span> to view restricted
          content.
        </h1>
      </header>
      <main className={styles.header}>
        <Login />
      </main>
    </>
  );
}
