import callGatewayData from "@/components/call-gateway-data";
import { getAuthCookies } from "@/components/checkCookies";
import Loading from "@/components/loading";
import { Suspense } from "react";
import PermissionsTable from "./permissions_table";
import Link from "next/link";
import handlePageLoadFailure from "@/components/errors/handle-page-load-errors";
import { Permission } from ".";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load permissions page";

export default async function PermissionsPage() {
  // quick for redirect if auth'd cookies not present
  const cookies = await getAuthCookies("/permissions");

  // check if identity cookie has permissions_read permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.identity || !cookies.identity.ux_render?.users?.user_read) {
    console.log(
      `${pageError}: user ${cookies.identity?.username} does not have rights to view /permissions.`
    );
    return handlePageLoadFailure(
      401,
      `you do not have rights to view /permissions.`
    );
  }

  // fetch permissions data from gateway
  const result = await callGatewayData<Permission[]>({
    endpoint: "/permissions",
    session: cookies.session,
  });
  if (!result.ok) {
    console.log(
      `${pageError} for user ${cookies.identity?.username}: ${result.error.message}`
    );
    return handlePageLoadFailure(result.error.code, result.error.message);
  }
  const permissions = result.data;

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
            <h1>Permissions</h1>
            {cookies.identity?.ux_render?.users?.scope_write && (
              <Link href="/permissions/add">
                <button>Add Permission</button>
              </Link>
            )}
          </div>
        </div>
        <hr className={`page-title`} />
        <div className="banner">
          <ul>
            <li>
              Permissions are fine-grained access controls that are attached to
              users and resources, in addition to scopes.
            </li>
            <li>
              To navigate to a specific permission record, click on the
              permission in the table below:
            </li>
          </ul>
        </div>

        <Suspense fallback={<Loading />}>
          <PermissionsTable data={permissions} />
        </Suspense>
      </main>
    </>
  );
}
