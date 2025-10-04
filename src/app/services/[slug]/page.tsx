import GetCsrf from "@/components/csrf-token";
import ClientForm from "@/components/forms/client-form";
import Loading from "@/components/loading";
import { Suspense } from "react";
import {
  genPatToken,
  handleClientEdit,
  handleReset,
  handleScopesUpdate,
} from "./actions";
import ResetForm from "@/components/forms/reset-form";
import Link from "next/link";
import { getAuthCookies } from "@/components/checkCookies";
import callGatewayData from "@/components/call-gateway-data";
import ManageScopesForm from "@/components/forms/manage-scopes-form";
import PatGenForm from "@/components/forms/pat-gen-form";
import { ServiceClient } from "..";
import handlePageLoadFailure from "@/components/errors/handle-page-load-errors";
import { Scope } from "@/app/scopes";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load service client page";

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
    console.log(
      `${pageError}: user ${cookies.identity?.username} does not have rights to view /services/${slug}.`
    );
    return handlePageLoadFailure(
      401,
      `you do not have rights to view /services/${slug}.`,
      "/services"
    );
  }

  // check if identity cookie has client_write permission
  let csrf: string | null = null;
  let client: ServiceClient | null = null;
  let allScopes: Scope[] = [];
  if (cookies.identity && cookies.identity.ux_render?.users?.client_write) {
    // get csrf token, client, and allScopes (menu) from gateway for client form
    const [csrfResult, clientResult, scopesResult] = await Promise.all([
      GetCsrf(cookies.session ? cookies.session : ""),
      callGatewayData<ServiceClient>({
        endpoint: `/clients/${slug}`,
        session: cookies.session,
      }),
      callGatewayData<Scope[]>({
        endpoint: `/scopes`,
        session: cookies.session,
      }),
    ]);

    if (!csrfResult.ok) {
      console.log(
        `${pageError} for user ${cookies.identity?.username}: ${csrfResult.error.message}`
      );
      return handlePageLoadFailure(
        csrfResult.error.code,
        csrfResult.error.message,
        "/services"
      );
    }
    csrf = csrfResult.data.csrf_token;

    if (!clientResult.ok) {
      console.log(
        `${pageError} for user ${cookies.identity?.username}: ${clientResult.error.message}`
      );
      return handlePageLoadFailure(
        clientResult.error.code,
        clientResult.error.message,
        "/services"
      );
    }
    client = clientResult.data;

    if (!scopesResult.ok) {
      console.log(
        `${pageError} for user ${cookies.identity?.username}: ${scopesResult.error.message}`
      );
      return handlePageLoadFailure(
        scopesResult.error.code,
        scopesResult.error.message,
        "/services"
      );
    }
    allScopes = scopesResult.data;
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

        {/* manage scopes form */}
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
              entityScopes={client?.scopes ? client.scopes : null}
              menuScopes={allScopes}
              updateScopes={handleScopesUpdate}
            />
          </div>
        </Suspense>

        {/* generate pat tokens form */}
        {cookies.identity.ux_render?.users?.client_write && (
          <>
            <div className="card-title">
              <h2>Generate PAT Token</h2>
            </div>
            <Suspense fallback={<Loading />}>
              <div className="card">
                <PatGenForm csrf={csrf} slug={slug} genPatToken={genPatToken} />
              </div>
            </Suspense>
          </>
        )}
      </main>
    </>
  );
}
