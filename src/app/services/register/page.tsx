import GetCsrf from "@/components/csrf-token";
import Loading from "@/components/loading";
import { Suspense } from "react";
import ClientRegistrationForm from "@/components/forms/client-registration-form";
import handleClientRegister from "./actions";
import Link from "next/link";
import { getAuthCookies } from "@/components/checkCookies";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load /services/register page: ";

export default async function Page() {
  // quick for redirect if auth'd cookies not present
  const cookies = await getAuthCookies("/services/register");

  // check if identity cookie has scopes_write permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.identity || !cookies.identity.ux_render?.users?.client_write) {
    console.log(pageError + "User does not have client_write permission.");
    throw new Error(pageError + "You do not have permission to add services.");
  }

  // get csrf token from gateway for add/register service form
  const csrf = await GetCsrf(cookies.session ? cookies.session : "");

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
          <h2>
            Add Service
            <sup>
              <span className="highlight-info" style={{ fontSize: ".65em" }}>
                *all fields are required
              </span>
            </sup>
          </h2>
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
