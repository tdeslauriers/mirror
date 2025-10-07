import GetCsrf from "@/components/csrf-token";
import Loading from "@/components/loading";
import { Suspense } from "react";
import ClientRegistrationForm from "@/components/forms/client-registration-form";
import handleClientRegister from "./actions";
import Link from "next/link";
import { getAuthCookies } from "@/components/checkCookies";
import handlePageLoadFailure from "@/components/errors/handle-page-load-errors";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load /services/register page";

export default async function Page() {
  // quick for redirect if auth'd cookies not present
  const cookies = await getAuthCookies("/services/register");
  if (!cookies.ok) {
    console.log(
      `${pageError}: failed auth cookie check: ${
        cookies.error ? cookies.error.message : "unknown error"
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

  // check if identity cookie has scopes_write permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.data.identity?.ux_render?.users?.client_write) {
    console.log(
      `${pageError}: user ${cookies.data.identity?.username} does not have rights to register a service.`
    );
    return handlePageLoadFailure(
      401,
      `you do not have rights to register a service.`,
      "/services"
    );
  }

  // get csrf token from gateway for add/register service form
  const csrfResult = await GetCsrf(cookies.data.session ?? "");
  if (!csrfResult.ok) {
    console.log(
      `${pageError} for user ${cookies.data.identity?.username}: ${csrfResult.error.message}`
    );
    return handlePageLoadFailure(
      csrfResult.error.code,
      csrfResult.error.message,
      "/services"
    );
  }
  const csrf = csrfResult.data.csrf_token;

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
