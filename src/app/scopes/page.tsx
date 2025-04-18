import Loading from "@/components/loading";
import { Suspense } from "react";
import ScopesTable from "./scopes_table";
import Link from "next/link";
import { getAuthCookies } from "@/components/checkCookies";
import callGatewayData from "@/components/call-gateway-data";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load scopes page: ";

export default async function ScopesPage() {
  // quick for redirect if auth'd cookies not present
  const cookies = await getAuthCookies("/scopes");

  // check if identity cookie has scopes_read permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.identity || !cookies.identity.ux_render?.users?.scope_read) {
    console.log(pageError + "User does not have scopes_read permission.");
    throw new Error(pageError + "You do not have permission to view scopes.");
  }

  // get scoeps data from gateway
  const scopes = await callGatewayData({
    endpoint: "/scopes",
    session: cookies.session,
  });

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
            <h1>Scopes</h1>
            {cookies.identity?.ux_render?.users?.scope_write && (
              <Link href="/scopes/add">
                <button>Add Scope</button>
              </Link>
            )}
          </div>
        </div>
        <hr className={`page-title`} />
        <div className="banner">
          To navigate to a specifc scope record, click on the scope in the table
          below:
        </div>

        <Suspense fallback={<Loading />}>
          <ScopesTable data={scopes} />
        </Suspense>
      </main>
    </>
  );
}
