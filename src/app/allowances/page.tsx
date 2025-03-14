import GetOauthExchange from "@/components/oauth-exchange";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import Loading from "@/components/loading";
import AllowancesTable from "./allowances-table";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError: string = "Failed to load allowances page.";

export default async function AllowancesPage() {
  // quick for redirect if auth'd cookies not present
  const cookieStore = await cookies();
  const hasIdentity = cookieStore.has("identity")
    ? cookieStore.get("identity")
    : null;
  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;

  if (!hasIdentity) {
    const oauth = await GetOauthExchange(hasSession?.value, "/allowances");
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

  // get allowances data from gateway
  const response = await fetch(
    `${process.env.GATEWAY_SERVICE_URL}/allowances`,
    {
      headers: {
        Authorization: `${hasSession?.value}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      const oauth = await GetOauthExchange(hasSession?.value, "/allowances");
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
  const allowances = await response.json();

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
