import Callback from "./callback";
import styles from "./page.module.css";

export default async function CallbackPage() {
  return (
    <>
      <main className={styles.header}>
        <Callback />
      </main>
    </>
  );
}
