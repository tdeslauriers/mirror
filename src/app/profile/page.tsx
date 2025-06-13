// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import UserForm from "../../components/forms/user-form";
import { Profile } from ".";
import { handleReset, handleUserEdit } from "./actions";
import GetCsrf from "@/components/csrf-token";
import ResetForm from "../../components/forms/reset-form";
import { Suspense } from "react";
import Loading from "@/components/loading";
import { getAuthCookies } from "@/components/checkCookies";
import callGatewayData from "@/components/call-gateway-data";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError: string = "Failed to load profile page: ";

export default async function ProfilePage() {
  // quick for redirect if auth'd cookies not present
  const cookies = await getAuthCookies("/profile");

  // get csrf token from gateway for profile form
  const csrf = await GetCsrf(cookies.session ? cookies.session : "");

  if (!csrf) {
    console.log(pageError + "CSRF token could not be retrieved.");
    throw new Error(pageError + "CSRF token could not be retrieved.");
  }

  // get profile data from gateway
  const profile: Profile = await callGatewayData({
    endpoint: "/profile",
    session: cookies.session,
  });

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
            <UserForm
              csrf={csrf}
              profile={profile}
              userEdit={handleUserEdit}
              editAllowed={profile?.username === cookies.identity?.username}
            />
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
