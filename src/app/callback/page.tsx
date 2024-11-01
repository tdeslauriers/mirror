import { Suspense } from "react";
import Callback from "./callback";
import styles from "./page.module.css";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function CallbackPage() {
  // quick redirect if auth'd cookies are present:
  // only unauthenticated users should be be able to be redirected/see the callback page
  // TODO: (replace lightweight cookie check) validate if session is auth'd at server layer, and active, redirect if so
  // light weight cookie check if the user has authenticated cookies and redirect to "/" if true
  const cookieStore = await cookies();
  const hasAuthenticated = cookieStore.has("authenticated")
    ? cookieStore.get("authenticated")
    : null;
  if (hasAuthenticated && hasAuthenticated.value === "true") {
    return redirect("/");
  }
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
