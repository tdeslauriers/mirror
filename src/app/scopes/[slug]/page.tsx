import ScopeForm from "@/components/forms/scope-form";
import GetCsrf from "@/components/csrf-token";
import { handleScopeEdit } from "./actions";
import { Suspense } from "react";
import Loading from "@/components/loading";
import Link from "next/link";
import { getAuthCookies } from "@/components/checkCookies";
import callGatewayData from "@/components/call-gateway-data";
import handlePageLoadFailure from "@/components/errors/handle-page-load-errors";
import { Scope } from "..";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load scope record page";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // get slug param from url
  const slug = (await params).slug;

  // quick for redirect if auth'd cookies not present
  const cookies = await getAuthCookies(`/scopes/${slug}`);
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

  // check if identity cookie has scopes_read permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.data.identity?.ux_render?.users?.scope_read) {
    console.log(
      `${pageError}: user ${cookies.data.identity?.username} does not have rights to view /scopes/${slug}.`
    );
    return handlePageLoadFailure(
      401,
      `you do not have rights to view /scopes/${slug}.`,
      "/scopes"
    );
  }

  // check if identity cookie has scopes_write permission and get csrf is so for scope form
  let csrf: string | null = null;
  let scope: Scope | null = null;
  if (cookies.data.identity?.ux_render?.users?.scope_write) {
    // get csrf token and scope from gateway for scope form
    const [csrfResult, scopeResult] = await Promise.all([
      GetCsrf(cookies.data.session ?? ""),
      callGatewayData<Scope>({
        endpoint: `/scopes/${slug}`,
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
        "/scopes"
      );
    }
    csrf = csrfResult.data.csrf_token;

    if (!scopeResult.ok) {
      console.log(
        `${pageError} for user ${cookies.data.identity?.username}: ${scopeResult.error.message}`
      );
      return handlePageLoadFailure(
        scopeResult.error.code,
        scopeResult.error.message,
        "/scopes"
      );
    }
    scope = scopeResult.data;
  }

  return (
    <>
      <main className={`main main-drawer`}>
        <div className={`center`}></div>
        <div className={`page-title`}>
          <div
            className="actions"
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingRight: "1rem",
            }}
          >
            {/* title */}
            <h1>
              Scope:{" "}
              {scope && scope.scope && (
                <span className="highlight">{scope.scope}</span>
              )}
            </h1>

            {/* // link to scopes table */}
            <Link href={`/scopes`}>
              <button>Scopes Table</button>
            </Link>
          </div>
        </div>
        <hr className={`page-title`} />
        {scope && scope.created_at && (
          <div className="banner">
            Scope created{" "}
            {new Date(scope.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        )}

        <div className="card-title">
          <h2>
            Scope Id:{" "}
            {scope && scope.scope_id && (
              <span className="highlight">{scope.scope_id}</span>
            )}
          </h2>
        </div>

        <Suspense fallback={<Loading />}>
          <div className="card">
            <ScopeForm
              csrf={csrf}
              editAllowed={cookies.data.identity?.ux_render?.users?.scope_write}
              slug={slug}
              scope={scope}
              scopeFormUpdate={handleScopeEdit}
            />
          </div>
        </Suspense>
      </main>
    </>
  );
}
