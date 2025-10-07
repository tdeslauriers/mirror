import Loading from "@/components/loading";
import { Suspense } from "react";
import ServicesTable from "./services_table";
import Link from "next/link";
import { getAuthCookies } from "@/components/checkCookies";
import callGatewayData from "@/components/call-gateway-data";
import handlePageLoadFailure from "@/components/errors/handle-page-load-errors";
import { ServiceClient } from ".";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load services page";

export default async function ServicesPage() {
  // quick for redirect if auth'd cookies not present
  const cookies = await getAuthCookies("/services");
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

  // check if identity cookie has services_read permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.data.identity?.ux_render?.users?.client_read) {
    console.log(
      `${pageError}: user ${cookies.data.identity?.username} does not have rights to view /services.`
    );
    return handlePageLoadFailure(
      401,
      `you do not have rights to view /services.`
    );
  }

  // get services data from gateway
  const result = await callGatewayData<ServiceClient[]>({
    endpoint: "/clients",
    session: cookies.data.session,
  });
  if (!result.ok) {
    console.log(
      `${pageError} for user ${cookies.data.identity?.username}: ${result.error.message}`
    );
    return handlePageLoadFailure(result.error.code, result.error.message);
  }
  const clients = result.data;

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
            {cookies.data.identity?.ux_render?.users?.client_write && (
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
