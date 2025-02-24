import GetOauthExchange from "@/components/oauth-exchange";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ScopeForm from "@/components/forms/scope-form";
import GetCsrf from "@/components/csrf-token";
import { handleScopeEdit } from "./actions";
import { Suspense } from "react";
import Loading from "@/components/loading";
import Link from "next/link";

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
  const cookieStore = await cookies();
  const hasIdentity = cookieStore.has("identity")
    ? cookieStore.get("identity")
    : null;
  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;

  if (!hasIdentity) {
    const oauth = await GetOauthExchange(hasSession?.value, `/scopes/${slug}`);
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

  // get scope record data from gateway
  const response = await fetch(
    `${process.env.GATEWAY_SERVICE_URL}/scopes/${slug}`,
    {
      headers: {
        Authorization: `${hasSession?.value}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      const oauth = await GetOauthExchange(
        hasSession?.value,
        `/scopes/${slug}`
      );
      if (oauth) {
        redirect(
          `/login?client_id=${oauth.client_id}&response_type=${oauth.response_type}&state=${oauth.state}&nonce=${oauth.nonce}&redirect_url=${oauth.redirect_url}`
        );
      } else {
        redirect("/login");
      }
    } else {
      const fail = await response.json();
      throw new Error(fail.message);
    }
  }

  const scope = await response.json();

  return (
    <>
      <main className={`main main-drawer`}>
        <div className={`center`}>
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
                <button>Back</button>
              </Link>
            </div>
          </div>
          <hr className={`page-title`} />
          {scope && scope.created_at && (
            <p style={{ fontStyle: "italic" }}>
              Scope created{" "}
              {new Date(scope.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>
        <div className="card-title">
          <h2>
            Scope Id:{" "}
            {scope && scope.scope_id && (
              <span className="highlight">{scope.scope_id}</span>
            )}
          </h2>
        </div>
        <div className="card">
          <Suspense fallback={<Loading />}>
            <ScopeForm
              csrf={csrf}
              slug={slug}
              scope={scope}
              scopeFormUpdate={handleScopeEdit}
            />
          </Suspense>
        </div>
      </main>
    </>
  );
}
