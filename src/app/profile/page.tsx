process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { cookies } from "next/headers";
import styles from "./page.module.css";
import { redirect } from "next/navigation";
import UserForm from "./user-form";

import { Profile } from ".";
import { handleReset, handleUserEdit } from "./actions";
import { pageError } from "../login";
import GetCsrf from "@/components/csrf-token";
import ResetForm from "./reset-form";

export default async function ProfilePage() {
  // quick for redirect if auth'd cookies not present
  const cookieStore = await cookies();
  const hasAuthenticated = (await cookieStore.has("authenticated"))
    ? cookieStore.get("authenticated")
    : null;
  const hasIdentity = cookieStore.has("identity")
    ? cookieStore.get("identity")
    : null;
  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;

  if (!hasAuthenticated || !hasIdentity || hasAuthenticated.value === "false") {
    redirect("/login");
  }

  // check session cookie exists for api calls
  if (!hasSession) {
    console.log("Session cookie is missing");
    throw new Error(pageError);
  }

  // get csrf token from gateway for registration form
  const csrf = await GetCsrf(hasSession.value);

  if (!csrf) {
    console.log("CSRF token could not be retrieved.");
    throw new Error(pageError);
  }

  // get profile data from gateway
  const response = await fetch("https://localhost:8443/profile", {
    headers: {
      Authorization: `${hasSession?.value}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      redirect("/login");
    } else {
      const fail = await response.json();
      throw new Error(fail.message);
    }
  }

  // parse profile data from response
  const profile: Profile = await response.json();

  // create the 'registered since' date
  const createdAt = profile.created_at ? profile.created_at : "";
  const regDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <header className={styles.header}>
        <h1>
          <>
            Username:{" "}
            <span className={styles.highlight}>{profile?.username}</span>
          </>
        </h1>
        {createdAt.length > 0 && <p>Registered since {regDate}</p>}
      </header>
      <main className={styles.main}>
        <h2>Identity</h2>
        <div className={styles.card}>
          <UserForm csrf={csrf} profile={profile} userEdit={handleUserEdit} />
        </div>
        <br />
        <h2>Reset Password</h2>
        <div className={styles.card}>
          <ResetForm csrf={csrf} handleReset={handleReset} />
        </div>
      </main>
    </>
  );
}
