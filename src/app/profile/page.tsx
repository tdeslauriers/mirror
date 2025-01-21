// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import UserForm from "./user-form";

import { Profile } from ".";
import { handleReset, handleUserEdit } from "./actions";

import GetCsrf from "@/components/csrf-token";
import ResetForm from "./reset-form";
import GetOauthExchange from "@/components/oauth-exchange";
import { Suspense } from "react";
import Loading from "@/components/loading";

const pageError: string = "Failed to load profile page: ";

export default async function ProfilePage() {
  // quick for redirect if auth'd cookies not present
  const cookieStore = await cookies();
  const hasIdentity = cookieStore.has("identity")
    ? cookieStore.get("identity")
    : null;
  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;

  if (!hasIdentity) {
    const oauth = await GetOauthExchange(hasSession?.value, "/profile");
    if (oauth) {
      redirect(
        `/login?client_id=${oauth.client_id}&response_type=${oauth.response_type}&state=${oauth.state}&nonce=${oauth.nonce}&redirect_url=${oauth.redirect_url}`
      );
    } else {
      redirect("/login");
    }
  }

  // check session cookie exists for api calls
  if (!hasSession) {
    console.log(pageError + "session cookie is missing");
    throw new Error(pageError + "session cookie is missing");
  }

  // get csrf token from gateway for registration form
  const csrf = await GetCsrf(hasSession.value);

  if (!csrf) {
    console.log(pageError + "CSRF token could not be retrieved.");
    throw new Error(pageError + "CSRF token could not be retrieved.");
  }

  // get profile data from gateway
  const response = await fetch(`${process.env.GATEWAY_SERVICE_URL}/profile`, {
    headers: {
      Authorization: `${hasSession?.value}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      const oauth = await GetOauthExchange(hasSession?.value, "/profile");
      if (oauth) {
        redirect(
          `/login?client_id=${oauth.client_id}&response_type=${oauth.response_type}&state=${oauth.state}&nonce=${oauth.nonce}&redirect_url=${oauth.redirect_url}`
        );
      } else {
        redirect("/login");
      }
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
      <main className={`main main-drawer`}>
        <div className={`center`}>
          <h1>
            Username: <span className={`highlight`}>{profile?.username}</span>
          </h1>

          {createdAt.length > 0 && (
            <p style={{ marginTop: ".5rem", fontStyle: "italic" }}>
              Registered since {regDate}
            </p>
          )}
        </div>

        <h2>Identity</h2>
        <div className={`card`}>
          <Suspense fallback={<Loading />}>
            <UserForm csrf={csrf} profile={profile} userEdit={handleUserEdit} />
          </Suspense>
        </div>

        <br />

        <h2>Reset Password</h2>
        <div className={`card`}>
          <Suspense fallback={<Loading />}>
            <ResetForm csrf={csrf} handleReset={handleReset} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
