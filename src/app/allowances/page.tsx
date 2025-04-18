import Link from "next/link";
import { Suspense } from "react";
import Loading from "@/components/loading";
import AllowancesTable from "./allowances-table";
import { getAuthCookies } from "@/components/checkCookies";
import callGatewayData from "@/components/call-gateway-data";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load allowances page: ";

export default async function AllowancesPage() {
  // quick for redirect if auth'd cookies not present
  const cookies = await getAuthCookies("/allowances");

  // check if identity cookie has allowances_read permission
  // ie, gaurd pattern or access hint gating
  if (
    !cookies.identity ||
    !cookies.identity.ux_render?.tasks?.allowances_read
  ) {
    console.log(pageError + "User does not have allowances_read permission.");
    throw new Error(
      pageError + "You do not have permission to view allowances."
    );
  }

  // get allowances data from gateway
  const allowances = await callGatewayData({
    endpoint: "/allowances",
    session: cookies.session,
  });

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
            {cookies.identity &&
              cookies.identity.ux_render?.tasks?.allowances_write && (
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
