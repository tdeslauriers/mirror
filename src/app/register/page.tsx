// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { cookies } from "next/headers";
import RegistrationForm from "./registration-form";
import { redirect } from "next/navigation";
import GetCsrf from "@/components/csrf-token";
import { pageError } from ".";
import { handleRegistration } from "./actions";
import { Suspense } from "react";
import Loading from "@/components/loading";
import Link from "next/link";
import handlePageLoadFailure from "@/components/errors/handle-page-load-errors";

export const metadata = {
  robots: "noindex, nofollow",
};

export default async function Registration() {
  // quick redirect if auth'd cookies are present:
  // only unauthenticated users should be able to register
  const cookieStore = await cookies();

  const hasIdentity = cookieStore.has("identity")
    ? cookieStore.get("identity")
    : null;

  if (hasIdentity) {
    console.log("User has authenticated cookies. Redirecting to home.");
    redirect("/");
  }

  // get csrf token from gateway for registration form
  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;

  if (!hasSession) {
    console.log("Session cookie is missing");
    return handlePageLoadFailure(401, "Session cookie is missing.");
  }

  const csrfResult = await GetCsrf(hasSession.value);
  if (!csrfResult.ok) {
    console.log(`${pageError}: ${csrfResult.error.message}`);
    return handlePageLoadFailure(
      csrfResult.error.code,
      csrfResult.error.message
    );
  }

  const csrf = csrfResult.data.csrf_token;

  return (
    <>
      <main className={`main`}>
        <div className={`center`}></div>
        <h1>
          <span className={`highlight`}>Sign up</span> for an account.
        </h1>
        <p>
          <Link className="locallink" href="/login">
            Already Registered?
          </Link>
        </p>

        <Suspense fallback={<Loading />}>
          <div className={`card`}>
            <RegistrationForm
              csrf={csrf}
              handleRegistration={handleRegistration}
            />
          </div>
        </Suspense>
      </main>
    </>
  );
}
