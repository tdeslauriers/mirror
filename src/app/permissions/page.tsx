import callGatewayData from "@/components/call-gateway-data";
import { getAuthCookies } from "@/components/checkCookies";
import Loading from "@/components/loading";
import { Suspense } from "react";
import PermissionsTable from "./permissions_table";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load permissions page: ";

export default async function PermissionsPage() {
  // quick for redirect if auth'd cookies not present
  const cookies = await getAuthCookies("/permissions");

  // check if identity cookie has permissions_read permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.identity || !cookies.identity.ux_render?.users?.user_read) {
    console.log(pageError + "User does not have permissions_read permission.");
    throw new Error(
      pageError + "You do not have permission to view permissions."
    );
  }

  // fetch permissions data from gateway
  const permissions = await callGatewayData({
    endpoint: "/permissions",
    session: cookies.session,
  });

  return (
    <>
      <main className={`main main-drawer`}>
        <div className={`center`}></div>
        <div className={`page-title`}>
          <h1>Permissions</h1>
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
