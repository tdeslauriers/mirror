import Loading from "@/components/loading";
import GetOauthExchange from "@/components/oauth-exchange";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import ScopesTable from "./scopes_table";
import Link from "next/link";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError: string = "Failed to load scopes page: ";

export default async function ScopesPage() {
  // quick for redirect if auth'd cookies not present
  const cookieStore = await cookies();
  const hasIdentity = cookieStore.has("identity")
    ? cookieStore.get("identity")
    : null;
  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;

  if (!hasIdentity) {
    const oauth = await GetOauthExchange(hasSession?.value, "/scopes");
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

  // get scoeps data from gateway
  const response = await fetch(`${process.env.GATEWAY_SERVICE_URL}/scopes`, {
    headers: {
      Authorization: `${hasSession?.value}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      const oauth = await GetOauthExchange(hasSession?.value, "/scopes");
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

  const scopes = await response.json();

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
