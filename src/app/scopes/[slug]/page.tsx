
import ScopeForm from "@/components/forms/scope-form";
import GetCsrf from "@/components/csrf-token";
import { handleScopeEdit } from "./actions";
import { Suspense } from "react";
import Loading from "@/components/loading";
import Link from "next/link";
import checkForIdentityCookie from "@/components/check-for-id-cookie";
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
  const cookies = await checkForIdentityCookie(`/scopes/${slug}`);

  // get csrf token from gateway for scope form
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

  // get scope record data from gateway
  const scope = await callGatewayData(
    `/scopes/${slug}`,
    cookies.session?.value
  );

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
