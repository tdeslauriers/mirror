process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { cookies } from "next/headers";
import styles from "./page.module.css";
import { redirect } from "next/navigation";
import UserForm from "./user-form";

import { Profile } from ".";
import { handleUserEdit } from "./actions";

export default async function ProfilePage() {
  // get session cookie for api call for additional data needed from silohuette

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

  const response = await fetch("https://localhost:8443/profile", {
    headers: {
      Authorization: `${hasSession?.value}`,
    },
  });

  if (!response.ok) {
    redirect("/login");
  }

  const profile: Profile = await response.json();

  return (
    <>
      <header className={styles.header}>
        <h1>
          <>
            Username:{" "}
            <span className={styles.highlight}>{profile?.username}</span>
          </>
        </h1>
      </header>
      <main className={styles.main}>
        <div className={styles.card}>
          <UserForm profile={profile} userEdit={handleUserEdit} />
        </div>
      </main>
    </>
  );
}
