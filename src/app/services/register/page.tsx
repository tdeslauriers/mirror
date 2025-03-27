import GetCsrf from "@/components/csrf-token";
import Loading from "@/components/loading";
import GetOauthExchange from "@/components/oauth-exchange";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import ClientRegistrationForm from "@/components/forms/client-registration-form";
import handleClientRegister from "./actions";
import Link from "next/link";
import checkForIdentityCookie from "@/components/check-for-id-cookie";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load /services/register page: ";

export default async function Page() {
  // quick for redirect if auth'd cookies not present
  const cookies = await checkForIdentityCookie("/services/register");

  // get csrf token from gateway for profile form
  const csrf = await GetCsrf(
    cookies.session?.value ? cookies.session.value : ""
  );

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
        <Suspense fallback={<Loading />}>
          <div className="card">
            <ClientRegistrationForm
              csrf={csrf}
              handleClientRegister={handleClientRegister}
            />
          </div>
        </Suspense>
      </main>
    </>
  );
}
