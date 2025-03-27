import Loading from "@/components/loading";
import { Suspense } from "react";
import ServicesTable from "./services_table";
import Link from "next/link";
import checkForIdentityCookie from "@/components/check-for-id-cookie";
import callGatewayData from "@/components/call-gateway-data";

export const metadata = {
  robots: "noindex, nofollow",
};

export default async function ServicesPage() {
  // quick for redirect if auth'd cookies not present
  const cookies = await checkForIdentityCookie("/services");

  // get services data from gateway
  const clients = await callGatewayData("/clients", cookies.session?.value);

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
            <h1>Services</h1>
            <Link href="/services/register">
              <button>Register Service</button>
            </Link>
          </div>
        </div>
        <hr className="page-title" />
        <div className="banner">
          To navigate to a specifc service record, click on the service in the
          table below:
        </div>

        <Suspense fallback={<Loading />}>
          <ServicesTable data={clients} />
        </Suspense>
      </main>
    </>
  );
}
