import GetCsrf from "@/components/csrf-token";
import ScopeForm from "@/components/forms/scope-form";
import { handleScopeAdd } from "./actions";
import Link from "next/link";
import { Suspense } from "react";
import Loading from "@/components/loading";
import { getAuthCookies } from "@/components/checkCookies";
import handlePageLoadFailure from "@/components/errors/handle-page-load-errors";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load scope add page";

export default async function ScopesAddPage() {
  // quick for redirect if auth'd cookies not present
  const cookies = await getAuthCookies("/scopes/add");

  // check if identity cookie has scopes_write permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.identity || !cookies.identity.ux_render?.users?.scope_write) {
    console.log(
      `${pageError}: user ${cookies.identity?.username} does not have rights to add a scope.`
    );
    return handlePageLoadFailure(
      401,
      `you do not have rights to add a scope.`,
      "/scopes"
    );
  }

  // get csrf token from gateway for profile form
  const csrfResult = await GetCsrf(cookies.session ? cookies.session : "");
  if (!csrfResult.ok) {
    console.log(
      `${pageError} for user ${cookies.identity?.username}: ${csrfResult.error.message}`
    );
    return handlePageLoadFailure(
      csrfResult.error.code,
      csrfResult.error.message,
      "/scopes"
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
              Scope: <span className="highlight">add</span>
            </h1>
            <Link href="/scopes">
              <button>Scopes Table</button>
            </Link>
          </div>
        </div>
        <hr className={`page-title`} />

        {/* banner */}
        <div className="banner">
          Scopes grant access to resources and services, specifically endpoints.
          They can either be authorization in their own right, or combined with
          fine fine-grain permssions.
        </div>

        <div className="card-title">
          <h2>Add Scope</h2>
        </div>

        {/* scope form */}
        <Suspense fallback={<Loading />}>
          <div className="card">
            <ScopeForm
              csrf={csrf}
              editAllowed={cookies.identity?.ux_render?.users?.scope_write}
              slug={null}
              scope={null}
              scopeFormUpdate={handleScopeAdd}
            />
          </div>
        </Suspense>
      </main>
    </>
  );
}
