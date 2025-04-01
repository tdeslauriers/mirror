import Loading from "@/components/loading";
import { Suspense } from "react";
import ScopesTable from "./scopes_table";
import Link from "next/link";
import { checkForIdentityCookie } from "@/components/checkCookies";
import callGatewayData from "@/components/call-gateway-data";

export const metadata = {
  robots: "noindex, nofollow",
};

export default async function ScopesPage() {
  // quick for redirect if auth'd cookies not present
  const cookies = await checkForIdentityCookie("/scopes");

  // get scoeps data from gateway
  const scopes = await callGatewayData("/scopes", cookies.session?.value);

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
            <Link href="/scopes/add">
              <button>Add Scope</button>
            </Link>
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
