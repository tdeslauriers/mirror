process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { cookies } from "next/headers";
import styles from "./page.module.css";
import Register from "./register";
import { redirect } from "next/navigation";
import GetCsrf from "@/components/csrf-token";
import { pageError } from ".";
import { handleRegistration } from "./actions";

export default async function Registration() {
  // quick redirect if auth'd cookies are present:
  // only unauthenticated users should be able to register
  const cookieStore = await cookies();
  const hasAuthenticated = (await cookieStore.has("authenticated"))
    ? cookieStore.get("authenticated")
    : null;
  const hasIdentity = cookieStore.has("identity")
    ? cookieStore.get("identity")
    : null;

  if (hasAuthenticated?.value === "true" || hasIdentity) {
    console.log("User has authenticated cookies. Redirecting to home.");
    redirect("/");
  }

  // get csrf token from gateway for registration form
  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;
  if (!hasSession) {
    console.log("Session cookie is missing");
    throw new Error(pageError);
  }
  const csrf = await GetCsrf(hasSession.value);

  if (!csrf) {
    console.log("CSRF token could not be retrieved.");
    throw new Error(pageError);
  }

  const registration = { csrf: csrf };

  return (
    <>
      <header className={styles.header}>
        <h1>
          <span className={styles.highlight}>Sign up</span> for an account.
        </h1>
      </header>
      <main className={styles.main}>
        <div className={styles.card}>
          <Register
            registrationComplete={false}
            registration={registration}
            handleRegistration={handleRegistration}
          />
        </div>
      </main>
    </>
  );
}
