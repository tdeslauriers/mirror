import Loading from "@/components/loading";
import GetOauthExchange from "@/components/oauth-exchange";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import ServicesTable from "./services_table";
import Link from "next/link";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError: string = "Failed to load clients page.";

export default async function ServicesPage() {
  // quick for redirect if auth'd cookies not present
  const cookieStore = await cookies();
  const hasIdentity = cookieStore.has("identity")
    ? cookieStore.get("identity")
    : null;
  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;

  if (!hasIdentity) {
    const oauth = await GetOauthExchange(hasSession?.value, "/services");
    if (oauth) {
      redirect(
        `/login?client_id=${oauth.client_id}&response_type=${oauth.response_type}&state=${oauth.state}&nonce=${oauth.nonce}&redirect_url=${oauth.redirect_url}`
      );
    } else {
      redirect("/login");
    }
  }

  // check session cookie exists for api call
  if (!hasSession) {
    console.log(pageError + "session cookie is missing");
    throw new Error(pageError + "session cookie is missing");
  }

  // get services data from gateway
  const response = await fetch(`${process.env.GATEWAY_SERVICE_URL}/clients`, {
    headers: {
      Authorization: `${hasSession?.value}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      const oauth = await GetOauthExchange(hasSession?.value, "/services");
      if (oauth) {
        redirect(
          `/login?client_id=${oauth.client_id}&response_type=${oauth.response_type}&state=${oauth.state}&nonce=${oauth.nonce}&redirect_url=${oauth.redirect_url}`
        );
      } else {
        redirect("/login");
      }
    } else {
      const fail = await response.json();
      throw new Error(fail.message);
    }
  }

  const clients = await response.json();

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
