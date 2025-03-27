import Link from "next/link";
import { Suspense } from "react";
import Loading from "@/components/loading";
import AllowancesTable from "./allowances-table";
import checkForIdentityCookie from "@/components/check-for-id-cookie";
import callGatewayData from "@/components/call-gateway-data";

export const metadata = {
  robots: "noindex, nofollow",
};

export default async function AllowancesPage() {
  // quick for redirect if auth'd cookies not present
  const cookies = await checkForIdentityCookie("/allowances");

  // get allowances data from gateway
  const allowances = await callGatewayData(
    "/allowances",
    cookies.session?.value
  );

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
            <Link href="/allowances/add">
              <button>Add Allowance Remitee</button>
            </Link>
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
