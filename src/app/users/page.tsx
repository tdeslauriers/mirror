import Loading from "@/components/loading";
import { Suspense } from "react";
import UserTable from "./user-table";
import { getAuthCookies } from "@/components/checkCookies";
import callGatewayData from "@/components/call-gateway-data";

export const metadata = {
  robots: "noindex, nofollow",
};

export default async function UsersPage() {
  // quick for redirect if auth'd cookies not present
  const cookies = await getAuthCookies("/users");

  // check if identity cookie has user_read permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.identity || !cookies.identity.ux_render?.users?.user_read) {
    console.log(
      "Failed to load users page. User does not have user_read permission."
    );
    throw new Error(
      "Failed to load users page. You do not have permission to view this page."
    );
  }

  // get user data from gateway
  const users = await callGatewayData({
    endpoint: "/users",
    session: cookies.session,
  });

  return (
    <>
      <main className={`main main-drawer`}>
        <div className={`center`}></div>
        <div className={`page-title`}>
          <h1>Users</h1>
        </div>
        <hr className={`page-title`} />
        <div className="banner">
          To navigate to a specifc user record, click on their username in the
          table below:
        </div>

        <Suspense fallback={<Loading />}>
          <UserTable data={users} />
        </Suspense>
      </main>
    </>
  );
}
