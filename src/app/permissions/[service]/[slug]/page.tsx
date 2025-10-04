import callGatewayData from "@/components/call-gateway-data";
import { getAuthCookies } from "@/components/checkCookies";
import GetCsrf from "@/components/csrf-token";
import PermissionForm from "@/components/forms/permission-form";
import Loading from "@/components/loading";
import Link from "next/link";
import { Suspense } from "react";
import { handlePermissionEdit } from "./actions";
import handlePageLoadFailure from "@/components/errors/handle-page-load-errors";
import { Permission } from "../..";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load permission/service/slug page";

export default async function PermissionEditPage({
  params,
}: {
  params: Promise<{ service: string; slug: string }>;
}) {
  // get param: service and slug from url
  const { service, slug } = await params;

  // quick for redirect if auth'd cookies not present
  const cookies = await getAuthCookies(`/permissions/${service}/${slug}`);

  // check if identity cookie has permissions_read permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.identity || !cookies.identity.ux_render?.users?.scope_read) {
    console.log(
      `${pageError}: user ${cookies.identity?.username} does not have rights to view /permissions/${service}/${slug}.`
    );
    return handlePageLoadFailure(
      401,
      `you do not have rights to view /permissions/${service}/${slug}.`,
      "/permissions"
    );
  }

  // check if identity cookie has permissions_write permission and get csrf is so for permission form
  let csrf: string | null = null;
  let permission: Permission | null = null;
  if (cookies.identity && cookies.identity.ux_render?.users?.scope_write) {
    // get csrf token and permissions from gateway for permission form
    const [csrfResult, permissionResult] = await Promise.all([
      GetCsrf(cookies.session ? cookies.session : ""),
      callGatewayData<Permission>({
        endpoint: `/permissions/${service}/${slug}`,
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
        "/permissions"
      );
    }
    csrf = csrfResult.data.csrf_token;

    if (!permissionResult.ok) {
      console.log(
        `${pageError} for user ${cookies.identity?.username}: ${permissionResult.error.message}`
      );
      return handlePageLoadFailure(
        permissionResult.error.code,
        permissionResult.error.message,
        "/permissions"
      );
    }
    permission = permissionResult.data;
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
            <h1>
              Permission: <span className="highlight">{permission?.name}</span>
            </h1>
            <Link
              href={`/permissions
              `}
            >
              <button>Permissions Table</button>
            </Link>
          </div>
        </div>
        <hr className={`page-title`} />

        {/* Date created */}
        {permission && permission.created_at && (
          <div className={`banner`}>
            Permission created{" "}
            {new Date(permission.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        )}

        {/* form title */}
        <div className="card-title">
          <h2>
            Permission Id:{" "}
            {permission && permission.uuid && (
              <span className="highlight">{permission.uuid}</span>
            )}
          </h2>
        </div>

        {/* permission edit form */}
        <Suspense fallback={<Loading />}>
          <div className="card">
            <PermissionForm
              csrf={csrf}
              editAllowed={cookies.identity?.ux_render?.users?.scope_write}
              slug={slug}
              service={service}
              permission={permission}
              permissionFormUpdate={handlePermissionEdit}
            />
          </div>
        </Suspense>
      </main>
    </>
  );
}
