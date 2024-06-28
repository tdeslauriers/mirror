process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import styles from "./page.module.css";
import Register from "./register";

export default async function Registration() {
  return (
    <>
      <header className={styles.header}>
        <h1>
          <span className={styles.highlight}>Sign up</span> for an account.
        </h1>
      </header>
      <Register />
    </>
  );
}
