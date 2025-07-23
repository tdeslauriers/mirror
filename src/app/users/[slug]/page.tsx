import GetCsrf from "@/components/csrf-token";
import Link from "next/link";
import { Suspense } from "react";
import UserForm from "@/components/forms/user-form";
import Loading from "@/components/loading";
import {
  handlePermissionsUpdate,
  handleScopesUpdate,
  handleUserEdit,
} from "./actions";
import { getAuthCookies } from "@/components/checkCookies";
import callGatewayData from "@/components/call-gateway-data";
import ManageScopesForm from "@/components/forms/manage-scopes-form";
import ManagePermissionsForm from "@/components/forms/manage-permissions-form";
import { all } from "axios";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load user page.";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // get slug param from url
  const slug = (await params).slug;

  // quick for redirect if auth'd cookies not present
  const cookies = await getAuthCookies(`/users/${slug}`);

  // check if identity cookie has user_read permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.identity || !cookies.identity.ux_render?.users?.user_read) {
    console.log(pageError + "User does not have user_read permission.");
    throw new Error(
      pageError + "You do not have permission to view this page."
    );
  }

  // check if identity cookie has user_write permission
  let csrf: string | null = null;
  if (cookies.identity && cookies.identity.ux_render?.users?.user_write) {
    // get csrf token from gateway for user form
    csrf = await GetCsrf(cookies.session ? cookies.session : "");

    if (!csrf) {
      console.log(
        `${pageError} CSRF token could not be retrieved for user ${slug}.`
      );
      throw new Error(
        `${pageError} CSRF token could not be retrieved for user ${slug}.`
      );
    }
  }

  // get user record data from gateway
  const user = await callGatewayData({
    endpoint: `/users/${slug}`,
    session: cookies.session,
  });

  // get scopess data from gateway for scopes dropdown
  const allScopes = await callGatewayData({
    endpoint: "/scopes",
    session: cookies.session,
  });

  // get permissions data from the gateway for permissions dropdown
  const allPermissions = await callGatewayData({
    endpoint: "/permissions",
    session: cookies.session,
  });

  return (
    <>
      <main className={`main main-drawer`}>
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
              User: <span className="highlight">{user?.username}</span>
            </h1>
            <Link href={`/users`}>
              <button>Users Table</button>
            </Link>
          </div>
        </div>
        <hr className="page-title" />
        {user?.created_at && (
          <div className="banner">
            Registered since{" "}
            {new Date(user.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        )}
        <div className="card-title">
          <h2>User Uuid: {<span className="highlight">{user?.id}</span>}</h2>
        </div>

        <Suspense fallback={<Loading />}>
          <div className={`card`}>
            <UserForm
              csrf={csrf}
              editAllowed={cookies.identity?.ux_render?.users?.user_write}
              slug={slug}
              profile={user}
              userEdit={handleUserEdit}
            />
          </div>
        </Suspense>

        {/* manage permissions form */}
        <div className="card-title">
          <h2>
            Permissions:{" "}
            {cookies.identity.ux_render?.users?.client_write && (
              <sup>
                <span className="highlight-info" style={{ fontSize: ".65em" }}>
                  * must click &lsquo;Update Permissions&lsquo; to save changes
                </span>
              </sup>
            )}
          </h2>
        </div>
        <Suspense fallback={<Loading />}>
          <div className="card">
            <ManagePermissionsForm
              csrf={csrf}
              editAllowed={cookies.identity.ux_render?.users?.client_write}
              entitySlug={slug}
              entityPermissions={user?.permissions}
              menuPermissions={allPermissions}
              updatePermissions={handlePermissionsUpdate}
            />
          </div>
        </Suspense>

        {/* manage scopes form */}
        <div className="card-title">
          <h2>
            Scopes:{" "}
            {cookies.identity.ux_render?.users?.user_write && (
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
              editAllowed={cookies.identity?.ux_render?.users?.user_write}
              entitySlug={slug}
              entityScopes={user?.scopes}
              menuScopes={allScopes}
              updateScopes={handleScopesUpdate}
            />
          </div>
        </Suspense>
      </main>
    </>
  );
}
