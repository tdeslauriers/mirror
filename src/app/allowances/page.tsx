import Link from "next/link";
import { Suspense } from "react";
import Loading from "@/components/loading";
import AllowancesTable from "./allowances-table";
import { getAuthCookies } from "@/components/checkCookies";
import callGatewayData from "@/components/call-gateway-data";
import handlePageLoadFailure from "@/components/errors/handle-page-load-errors";
import { Allowance } from "@/components/forms";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load allowances page";

export default async function AllowancesPage() {
  // quick for redirect if auth'd cookies not present
  const cookies = await getAuthCookies("/allowances");
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

  // check if identity cookie has allowances_read permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.data.identity?.ux_render?.tasks?.allowances_read) {
    console.log(
      `${pageError}: user ${cookies.data.identity?.username} does not have rights to view /allowances.`
    );
    return handlePageLoadFailure(
      401,
      `you do not have rights to view /allowances.`
    );
  }

  // get allowances data from gateway
  const result = await callGatewayData<Allowance[]>({
    endpoint: "/allowances",
    session: cookies.data.session,
  });
  if (!result.ok) {
    console.log(
      `${pageError} for user ${cookies.data.identity?.username}: ${result.error.message}`
    );
    return handlePageLoadFailure(result.error.code, result.error.message);
  }

  // TODO: sort allowances by remitee name
  const allowances = result.data;


  return (
    <>
      <main className="main main-drawer">
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
            <h1>Allowances</h1>
            {cookies.data.identity?.ux_render?.tasks?.allowances_write && (
              <Link href="/allowances/add">
                <button>Add Allowance Remitee</button>
              </Link>
            )}
          </div>
        </div>
        <hr className="page-title" />
        <div className="banner">
          To navigate to a specifc allowance record, click on the remitee in the
          table below:
        </div>
        <Suspense fallback={<Loading />}>
          {allowances && <AllowancesTable data={allowances} />}
        </Suspense>
      </main>
    </>
  );
}
