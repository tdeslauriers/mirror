import Loading from "@/components/loading";
import { Suspense } from "react";
import ScopesTable from "./scopes_table";
import Link from "next/link";
import { getAuthCookies } from "@/components/checkCookies";
import callGatewayData from "@/components/call-gateway-data";
import handlePageLoadFailure from "@/components/errors/handle-page-load-errors";
import { Scope } from ".";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load scopes page";

export default async function ScopesPage() {
  // quick for redirect if auth'd cookies not present
  const cookies = await getAuthCookies("/scopes");
  if (!cookies.ok) {
    console.log(
      `${pageError} due to failed auth cookie check: ${
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

  // check if identity cookie has scopes_read access
  // ie, gaurd pattern or access hint gating
  if (!cookies.data.identity?.ux_render?.users?.scope_read) {
    console.log(
      `${pageError}: user ${cookies.data.identity?.username} does not have rights to view /scopes.`
    );
    return handlePageLoadFailure(
      401,
      `you do not have rights to view /scopes.`
    );
  }

  // get scoeps data from gateway
  const result = await callGatewayData<Scope[]>({
    endpoint: "/scopes",
    session: cookies.data.session,
  });
  if (!result.ok) {
    console.log(
      `${pageError} for user ${cookies.data.identity?.username}: ${result.error.message}`
    );
    return handlePageLoadFailure(result.error.code, result.error.message);
  }
  const scopes = result.data;

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
            {cookies.data.identity?.ux_render?.users?.scope_write && (
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
