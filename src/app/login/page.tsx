process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { Suspense } from "react";
import Login from "./login";
import styles from "./page.module.css";
import { cookies } from "next/headers";

import { redirect } from "next/navigation";

export default async function LoginPage() {
  // TODO: (replace lightweight cookie check) validate if session is auth'd at server layer, and active, redirect if so
  // light weight cookie check if the user has authenticated cookies and redirect to "/" if true
  const cookieStore = cookies();
  const hasAuthenticated = cookieStore.has("authenticated")
    ? cookieStore.get("authenticated")
    : null;
  if (hasAuthenticated && hasAuthenticated.value === "true") {
    return redirect("/");
  }

  return (
    <>
      <header className={styles.header}>
        <h1>
          <span className={styles.highlight}>Login</span> to view restricted
          content.
        </h1>
      </header>
      <main className={styles.header}>
        <Suspense fallback={<div>Loading...</div>}>
          <Login />
        </Suspense>
      </main>
    </>
  );
}
