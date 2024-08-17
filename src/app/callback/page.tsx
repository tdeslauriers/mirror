import { Suspense } from "react";
import Callback from "./callback";
import styles from "./page.module.css";

export default async function CallbackPage() {
  return (
    <>
      <main className={styles.header}>
        <Suspense fallback={<div>Loading...</div>}>
          <Callback />
        </Suspense>
      </main>
    </>
  );
}
