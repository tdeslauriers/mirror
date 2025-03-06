import GetCsrf from "@/components/csrf-token";
import Loading from "@/components/loading";
import GetOauthExchange from "@/components/oauth-exchange";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import ClientRegistrationForm from "@/components/forms/client-registration-form";
import handleClientRegister from "./actions";
import Link from "next/link";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load /services/register page: ";

export default async function Page() {
  // quick for redirect if auth'd cookies not present
  const cookieStore = await cookies();
  const hasIdentity = cookieStore.has("identity")
    ? cookieStore.get("identity")
    : null;
  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;

  if (!hasIdentity) {
    const oauth = await GetOauthExchange(
      hasSession?.value,
      "/services/register"
    );
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
    console.log(
      pageError + "CSRF token could not be retrieved for scope form."
    );
    throw new Error(
      pageError + "CSRF token could not be retrieved for scope form."
    );
  }

  return (
    <>
      <main className="main main-drawer">
        <div className="center"></div>
        <div className="page-title">
          <div
            className="actions"
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingRight: "1rem",
            }}
          >
            <h1>
              Service: <span className="highlight">register</span>
            </h1>
            <Link href="/services">
              <button>Services Table</button>
            </Link>
          </div>
        </div>
        <hr className={`page-title`} />

        <div className="card-title">
          <h2>Add Service</h2>
        </div>
        <div className="card">
          <Suspense fallback={<Loading />}>
            <ClientRegistrationForm
              csrf={csrf}
              handleClientRegister={handleClientRegister}
            />
          </Suspense>
        </div>
      </main>
    </>
  );
}
