import GetCsrf from "@/components/csrf-token";
import ClientForm from "@/components/forms/client-form";
import Loading from "@/components/loading";
import GetOauthExchange from "@/components/oauth-exchange";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { handleClientEdit, handleReset, handleScopesUpdate } from "./actions";
import ResetForm from "@/components/forms/reset-form";
import ScopesManageForm from "@/components/forms/scopes-manage-form";

const pageError = "Failed to load service client page.";

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
    const oauth = await GetOauthExchange(
      hasSession?.value,
      `/services/${slug}`
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
      pageError + "CSRF token could not be retrieved for client form."
    );
    throw new Error(
      pageError + "CSRF token could not be retrieved for client form."
    );
  }

  // get client record data from gateway
  const clientResponse = await fetch(
    `${process.env.GATEWAY_SERVICE_URL}/clients/${slug}`,
    {
      headers: {
        Authorization: `${hasSession?.value}`,
      },
    }
  );

  // get client
  if (!clientResponse.ok) {
    if (clientResponse.status === 401) {
      const oauth = await GetOauthExchange(
        hasSession?.value,
        `/services/${slug}`
      );
      if (oauth) {
        redirect(
          `/login?client_id=${oauth.client_id}&response_type=${oauth.response_type}&state=${oauth.state}&nonce=${oauth.nonce}&redirect_url=${oauth.redirect_url}`
        );
      } else {
        redirect("/login");
      }
    } else {
      const fail = await clientResponse.json();
      throw new Error(fail.message);
    }
  }

  const client = await clientResponse.json();

  // get scopess data from gateway for scopes dropdown
  const scopesResponse = await fetch(
    `${process.env.GATEWAY_SERVICE_URL}/scopes`,
    {
      headers: {
        Authorization: `${hasSession?.value}`,
      },
    }
  );

  if (!scopesResponse.ok) {
    if (scopesResponse.status === 401) {
      const oauth = await GetOauthExchange(
        hasSession?.value,
        `/services/${slug}`
      );
      if (oauth) {
        redirect(
          `/login?client_id=${oauth.client_id}&response_type=${oauth.response_type}&state=${oauth.state}&nonce=${oauth.nonce}&redirect_url=${oauth.redirect_url}`
        );
      } else {
        redirect("/login");
      }
    } else {
      const fail = await scopesResponse.json();
      throw new Error(fail.message);
    }
  }

  const allScopes = await scopesResponse.json();

  return (
    <>
      <main className="main main-drawer">
        <div className="center">
          <div className="page-title">
            <h1>
              Service:{" "}
              {client && client.name && (
                <span className="highlight">{client.name}</span>
              )}
            </h1>
          </div>
          <hr className="page-title" />

          {client && client.created_at && (
            <p>
              Client created{" "}
              {new Date(client.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>
        <div className="card-title">
          <h2>
            Service Slug:{" "}
            {client && client.slug && (
              <span className="highlight">{client.slug}</span>
            )}
          </h2>
        </div>
        <div className="card">
          <Suspense fallback={<Loading />}>
            <ClientForm
              csrf={csrf}
              slug={slug}
              client={client}
              clientFormUpdate={handleClientEdit}
            />
          </Suspense>
        </div>

        <div className="card-title">
          <h2>
            Reset Service Password:{" "}
            <sup>
              <span className="highlight-info" style={{ fontSize: ".65em" }}>
                *requires update of 1password, k8s secrets, and service restart
              </span>
            </sup>
          </h2>
        </div>
        <div className="card">
          <Suspense fallback={<Loading />}>
            <ResetForm
              csrf={csrf}
              resource_id={client && client.id ? client.id : undefined}
              handleReset={handleReset}
            />
          </Suspense>
        </div>

        <div className="card-title">
          <h2>
            Scopes:{" "}
            <sup>
              <span className="highlight-info" style={{ fontSize: ".65em" }}>
                * must click &lsquo;Update Scopes&lsquo; to save changes
              </span>
            </sup>
          </h2>
        </div>
        <div className="card">
          <Suspense fallback={<Loading />}>
            <ScopesManageForm
              csrf={csrf}
              slug={slug}
              entityScopes={client.scopes}
              menuScopes={allScopes}
              updateScopes={handleScopesUpdate}
            />
          </Suspense>
        </div>
      </main>
    </>
  );
}
