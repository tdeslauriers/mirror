import Loading from "@/components/loading";
import { Suspense } from "react";
import UserTable from "./user-table";
import { getAuthCookies } from "@/components/checkCookies";
import callGatewayData from "@/components/call-gateway-data";
import { User } from ".";
import handlePageLoadFailure from "@/components/errors/handle-page-load-errors";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load users page";

export default async function UsersPage() {
  // quick for redirect if auth'd cookies not present
  const cookies = await getAuthCookies("/users");
  if (!cookies.ok) {
    console.log(
      `${pageError}: could not verify session cookies: ${
        cookies.error ? cookies.error.message : "unknown error"
      }`
    );
    return handlePageLoadFailure(
      401,
      cookies.error
        ? cookies.error.message
        : "unknown error related to session cookies.",
      "/login"
    );
  }

  // check if identity cookie has user_read permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.data.identity?.ux_render?.users?.user_read) {
    console.log(
      `${pageError}: user ${cookies.data.identity?.username} does not have rights to view /users.`
    );
    return handlePageLoadFailure(401, `you do not have rights to view /users.`);
  }

  // get user data from gateway
  const result = await callGatewayData<User[]>({
    endpoint: "/users",
    session: cookies.data.session,
  });
  if (!result.ok) {
    console.log(
      `${pageError} for user ${cookies.data.identity?.username}: ${result.error.message}`
    );
    return handlePageLoadFailure(result.error.code, result.error.message);
  }
  const users = result.data;

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
