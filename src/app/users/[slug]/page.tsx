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
import handlePageLoadFailure from "@/components/errors/handle-page-load-errors";
import { Profile } from "@/app/profile";
import { Scope } from "@/app/scopes";
import { Permission } from "@/app/permissions";
import { User } from "..";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load user page";

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
    console.log(
      `${pageError}: user ${cookies.identity?.username} does not have rights to view /users/${slug}.`
    );
    return handlePageLoadFailure(
      401,
      `you do not have rights to view /users/${slug}.`,
      "/users"
    );
  }

  // check if identity cookie has user_write permission
  let csrf: string | null = null;
  let user: User | null = null;
  let allScopes: Scope[] = [];
  let allPermissions: Permission[] = [];
  if (cookies.identity && cookies.identity.ux_render?.users?.user_write) {
    // get csrf token, user data, scopes, and permissions from gateway for user form
    const [csrfResult, userResult, scopesResult, permissionsResult] =
      await Promise.all([
        GetCsrf(cookies.session ? cookies.session : ""),
        callGatewayData<any>({
          endpoint: `/users/${slug}`,
          session: cookies.session,
        }),
        callGatewayData<Scope[]>({
          endpoint: `/scopes`,
          session: cookies.session,
        }),
        callGatewayData<Permission[]>({
          endpoint: `/permissions`,
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
        "/users"
      );
    }
    csrf = csrfResult.data.csrf_token;

    if (!userResult.ok) {
      console.log(
        `${pageError} for user ${cookies.identity?.username}: ${userResult.error.message}`
      );
      return handlePageLoadFailure(
        userResult.error.code,
        userResult.error.message,
        "/users"
      );
    }
    user = userResult.data;

    if (!scopesResult.ok) {
      console.log(
        `${pageError} for user ${cookies.identity?.username}: ${scopesResult.error.message}`
      );
      return handlePageLoadFailure(
        scopesResult.error.code,
        scopesResult.error.message,
        "/users"
      );
    }
    allScopes = scopesResult.data;

    if (!permissionsResult.ok) {
      console.log(
        `${pageError} for user ${cookies.identity?.username}: ${permissionsResult.error.message}`
      );
      return handlePageLoadFailure(
        permissionsResult.error.code,
        permissionsResult.error.message,
        "/users"
      );
    }
    allPermissions = permissionsResult.data;
  }

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
              entityPermissions={user?.permissions ? user.permissions : []}
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
              entityScopes={user?.scopes ? user.scopes : null}
              menuScopes={allScopes}
              updateScopes={handleScopesUpdate}
            />
          </div>
        </Suspense>
      </main>
    </>
  );
}
