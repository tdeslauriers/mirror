// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import UserForm from "../../components/forms/user-form";
import { Profile } from ".";
import { handleReset, handleUserEdit } from "./actions";
import GetCsrf from "@/components/csrf-token";
import ResetForm from "../../components/forms/reset-form";
import GetOauthExchange from "@/components/oauth-exchange";
import { Suspense } from "react";
import Loading from "@/components/loading";

export const metadata = {
  robots: "noindex, nofollow",
};

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

  // get csrf token from gateway for profile form
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
    if (response.status === 401) {
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

  return (
    <>
      <main className={`main main-drawer`}>
        <div className={`center`}></div>
        <div className="page-title">
          <h1>
            Username: <span className={`highlight`}>{profile?.username}</span>
          </h1>
        </div>
        <hr className={`page-title`} />
        {profile && profile.created_at && (
          <div className="banner">
            
              Registered since{" "}
              {new Date(profile.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            
          </div>
        )}

        <div className="card-title">
          <h2>Identity</h2>
        </div>
        <div className={`card`}>
          <Suspense fallback={<Loading />}>
            <UserForm csrf={csrf} profile={profile} userEdit={handleUserEdit} />
          </Suspense>
        </div>

        <br />
        <div className="card-title">
          <h2>Reset Password</h2>
        </div>
        <div className={`card`}>
          <Suspense fallback={<Loading />}>
            <ResetForm csrf={csrf} handleReset={handleReset} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
