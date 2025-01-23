import Loading from "@/components/loading";
import GetOauthExchange from "@/components/oauth-exchange";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

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
    const oauth = await GetOauthExchange(hasSession?.value, "/users");
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

  // get user data from gateway
  const response = await fetch(`${process.env.GATEWAY_SERVICE_URL}/scopes`, {
    headers: {
      Authorization: `${hasSession?.value}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
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
        <div className={`center`}>
          <div className={`page-title`}>
            <h1>Scopes</h1>
          </div>
          <hr className={`page-title`} />
          <div style={{ fontStyle: "italic" }}>
            To navigate to a specifc scope, click on its row in the table below:
          </div>
        </div>
        <Suspense fallback={<Loading />}>
          {/* <ScopesTable data={scopes} /> */}
        </Suspense>
      </main>
    </>
  );
}
