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
import handlePageLoadFailure from "@/components/errors/handle-page-load-errors";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError: string = "Failed to load profile page: ";

export default async function ProfilePage() {
  // quick for redirect if auth'd cookies not present
  const cookies = await getAuthCookies("/profile");
  if (!cookies.ok) {
    console.log(
      `${pageError}: failed auth cookie check: ${
        cookies.error ? cookies.error.message : "unknown error related to session cookies."
      }`
    );
    return handlePageLoadFailure(
      401,
      cookies.error
        ? cookies.error.message
        : "unknown error related to session cookies.",
      "/login"
    );
  }

  // get csrf token and profile data from gateway for profile form
  const [csrfResult, profileResult] = await Promise.all([
    GetCsrf(cookies.data.session ?? ""),
    callGatewayData<Profile>({
      endpoint: "/profile",
      session: cookies.data.session,
    }),
  ]);

  if (!csrfResult.ok) {
    console.log(
      `${pageError} for user ${cookies.data.identity?.username}: ${csrfResult.error.message}`
    );
    return handlePageLoadFailure(
      csrfResult.error.code,
      csrfResult.error.message,
      "/"
    );
  }
  const csrf = csrfResult.data.csrf_token;

  if (!profileResult.ok) {
    console.log(
      `${pageError} for user ${cookies.data.identity?.username}: ${profileResult.error.message}`
    );
    return handlePageLoadFailure(
      profileResult.error.code,
      profileResult.error.message,
      "/"
    );
  }
  const profile = profileResult.data;

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
              editAllowed={profile?.username === cookies.data.identity?.username}
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
