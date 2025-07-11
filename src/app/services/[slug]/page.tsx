import GetCsrf from "@/components/csrf-token";
import ClientForm from "@/components/forms/client-form";
import Loading from "@/components/loading";
import { Suspense } from "react";
import { handleClientEdit, handleReset, handleScopesUpdate } from "./actions";
import ResetForm from "@/components/forms/reset-form";
import Link from "next/link";
import { getAuthCookies } from "@/components/checkCookies";
import callGatewayData from "@/components/call-gateway-data";
import ManageScopesForm from "@/components/forms/manage-scopes-form";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load service client page.";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // get slug param from url
  const slug = (await params).slug;

  // quick check for redirect if auth'd cookies not present
  const cookies = await getAuthCookies(`/services/${slug}`);

  // check if identity cookie has client_read permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.identity || !cookies.identity.ux_render?.users?.client_read) {
    console.log(pageError + "User does not have client_read permission.");
    throw new Error(
      pageError + "You do not have permission to view this page."
    );
  }

  // check if identity cookie has client_write permission
  let csrf: string | null = null;
  if (cookies.identity && cookies.identity.ux_render?.users?.client_write) {
    // get csrf token from gateway for service form
    csrf = await GetCsrf(cookies.session ? cookies.session : "");

    if (!csrf) {
      console.log(
        `${pageError} CSRF token could not be retrieved for service client ${slug}.`
      );
      throw new Error(
        `${pageError} CSRF token could not be retrieved for service client ${slug}.`
      );
    }
  }

  // get client record data from gateway
  const client = await callGatewayData({
    endpoint: `/clients/${slug}`,
    session: cookies.session,
  });

  // get scopess data from gateway for scopes dropdown
  const allScopes = await callGatewayData({
    endpoint: "/scopes",
    session: cookies.session,
  });

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
              Service:{" "}
              {client && client.name && (
                <span className="highlight">{client.name}</span>
              )}
            </h1>
            <Link href={`/services`}>
              <button>Services Table</button>
            </Link>
          </div>
        </div>
        <hr className="page-title" />

        {client && client.created_at && (
          <div className="banner">
            Client created{" "}
            {new Date(client.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        )}

        <div className="card-title">
          <h2>
            Serivce Uuid:{" "}
            {client && client.id && (
              <span className="highlight">{client.id}</span>
            )}
          </h2>
        </div>
        <div className="card">
          <Suspense fallback={<Loading />}>
            <ClientForm
              csrf={csrf}
              editAllowed={cookies.identity.ux_render?.users?.client_write}
              slug={slug}
              client={client}
              clientFormUpdate={handleClientEdit}
            />
          </Suspense>
        </div>

        {cookies.identity.ux_render?.users?.client_write && (
          <>
            <div className="card-title">
              <h2>
                Reset Service Password:{" "}
                <sup>
                  <span
                    className="highlight-info"
                    style={{ fontSize: ".65em" }}
                  >
                    *requires update of 1password, k8s secrets, and service
                    restart
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
          </>
        )}

        <div className="card-title">
          <h2>
            Scopes:{" "}
            {cookies.identity.ux_render?.users?.client_write && (
              <sup>
                <span className="highlight-info" style={{ fontSize: ".65em" }}>
                  * must click &lsquo;Update Scopes&lsquo; to save changes
                </span>
              </sup>
            )}
          </h2>
        </div>
        <Suspense fallback={<Loading />}>
          <div className="card">
            <ManageScopesForm
              csrf={csrf}
              editAllowed={cookies.identity.ux_render?.users?.client_write}
              entitySlug={slug}
              entityScopes={client.scopes}
              menuScopes={allScopes}
              updateScopes={handleScopesUpdate}
            />
          </div>
        </Suspense>
      </main>
    </>
  );
}
