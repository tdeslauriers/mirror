import Loading from "@/components/loading";
import { Suspense } from "react";
import UserTable from "./user-table";
import { checkForIdentityCookie } from "@/components/checkCookies";
import callGatewayData from "@/components/call-gateway-data";

export const metadata = {
  robots: "noindex, nofollow",
};

export default async function UsersPage() {
  // quick for redirect if auth'd cookies not present
  const cookies = await checkForIdentityCookie("/users");

  // get user data from gateway
  const users = await callGatewayData("/users", cookies.session?.value);

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
