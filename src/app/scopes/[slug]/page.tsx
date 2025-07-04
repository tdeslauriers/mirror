import ScopeForm from "@/components/forms/scope-form";
import GetCsrf from "@/components/csrf-token";
import { handleScopeEdit } from "./actions";
import { Suspense } from "react";
import Loading from "@/components/loading";
import Link from "next/link";
import { getAuthCookies } from "@/components/checkCookies";
import callGatewayData from "@/components/call-gateway-data";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load scope record page: ";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // get slug param from url
  const slug = (await params).slug;

  // quick for redirect if auth'd cookies not present
  const cookies = await getAuthCookies(`/scopes/${slug}`);

  // check if identity cookie has scopes_read permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.identity || !cookies.identity.ux_render?.users?.scope_read) {
    console.log(pageError + "User does not have scopes_read permission.");
    throw new Error(pageError + "You do not have permission to view scopes.");
  }

  // check if identity cookie has scopes_write permission and get csrf is so for scope form
  let csrf: string | null = null;
  if (cookies.identity && cookies.identity.ux_render?.users?.scope_write) {
    // get csrf token from gateway for scope form
    csrf = await GetCsrf(cookies.session ? cookies.session : "");

    if (!csrf) {
      console.log(
        pageError + "CSRF token could not be retrieved for scope form."
      );
      throw new Error(
        pageError + "CSRF token could not be retrieved for scope form."
      );
    }
  }

  // get scope record data from gateway
  const scope = await callGatewayData({
    endpoint: `/scopes/${slug}`,
    session: cookies.session,
  });

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
            <h1>
              Scope:{" "}
              {scope && scope.scope && (
                <span className="highlight">{scope.scope}</span>
              )}
            </h1>
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
              editAllowed={cookies.identity?.ux_render?.users?.scope_write}
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
