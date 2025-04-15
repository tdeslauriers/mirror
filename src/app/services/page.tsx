import Loading from "@/components/loading";
import { Suspense } from "react";
import ServicesTable from "./services_table";
import Link from "next/link";
import { getAuthCookies } from "@/components/checkCookies";
import callGatewayData from "@/components/call-gateway-data";

export const metadata = {
  robots: "noindex, nofollow",
};

export default async function ServicesPage() {
  // quick for redirect if auth'd cookies not present
  const cookies = await getAuthCookies("/services");

  // check if identity cookie has services_read permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.identity || !cookies.identity.ux_render?.users?.client_read) {
    console.log("User does not have client_read permission.");
    throw new Error("You do not have permission to view services.");
  }

  // get services data from gateway
  const clients = await callGatewayData("/clients", cookies.session);

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
            {cookies.identity &&
              cookies.identity.ux_render?.users?.client_write && (
                <Link href="/services/register">
                  <button>Register Service</button>
                </Link>
              )}
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
