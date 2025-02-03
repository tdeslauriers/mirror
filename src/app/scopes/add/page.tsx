import GetCsrf from "@/components/csrf-token";
import ScopeForm from "@/components/forms/scope-form";
import GetOauthExchange from "@/components/oauth-exchange";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { handleScopeAdd } from "./actions";


const pageError = "Failed to load scope add page: ";

export default async function Page() {
  // quick for redirect if auth'd cookies not present
  const cookieStore = await cookies();
  const hasIdentity = cookieStore.has("identity")
    ? cookieStore.get("identity")
    : null;
  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;

  if (!hasIdentity) {
    const oauth = await GetOauthExchange(hasSession?.value, `/scopes/add`);
    if (oauth) {
      redirect(
        `/login?client_id=${oauth.client_id}&response_type=${oauth.response_type}&state=${oauth.state}&nonce=${oauth.nonce}&redirect_url=${oauth.redirect_url}`
      );
    } else {
      redirect("/login");
    }
  }

  // check session cookie exists for api calls
  if (!hasSession) {
    console.log(pageError + "session cookie is missing");
    throw new Error(pageError + "session cookie is missing");
  }

  // get csrf token from gateway for profile form
  const csrf = await GetCsrf(hasSession.value);

  if (!csrf) {
    console.log(
      pageError + "CSRF token could not be retrieved for scope form."
    );
    throw new Error(
      pageError + "CSRF token could not be retrieved for scope form."
    );
  }

  return (
    <>
      <main className="main main-drawer">
        <div className="center">
          <div className="page-title">
            <h1>
              Scope: <span className="highlight">add</span>
            </h1>
          </div>
          <hr className={`page-title`} />
        </div>
        <div className="card-title">
          <h2>Add Scope</h2>
        </div>
        <div className="card">
          <ScopeForm
            csrf={csrf}
            slug={null}
            scope={null}
            scopeFormUpdate={handleScopeAdd}
          />
        </div>
      </main>
    </>
  );
}
