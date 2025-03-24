import GetCsrf from "@/components/csrf-token";
import { AllowanceUser } from "@/components/forms";
import TemplateForm from "@/components/forms/task-template-form";
import Loading from "@/components/loading";
import GetOauthExchange from "@/components/oauth-exchange";

import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { templateFormUpdate } from "./actions";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load task template add page: ";

export default async function AddPage() {
  // quick for redirect if auth'd cookies not present
  const cookieStore = await cookies();
  const hasIdentity = cookieStore.has("identity")
    ? cookieStore.get("identity")
    : null;
  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;

  if (!hasIdentity) {
    const oauth = await GetOauthExchange(hasSession?.value, `/templates/add`);
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

  // get list of assignees for form dropdown
  const assigneesResponse = await fetch(
    `${process.env.GATEWAY_SERVICE_URL}/templates/assignees`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${hasSession.value}`,
      },
    }
  );

  if (!assigneesResponse.ok) {
    console.log(assigneesResponse);
    if (assigneesResponse.status === 401) {
      const oauth = await GetOauthExchange(hasSession?.value, "/templates/add");
      if (oauth) {
        redirect(
          `/login?client_id=${oauth.client_id}&response_type=${oauth.response_type}&state=${oauth.state}&nonce=${oauth.nonce}&redirect_url=${oauth.redirect_url}`
        );
      } else {
        redirect("/login");
      }
    } else {
      const err = await assigneesResponse.json();
      throw new Error(err.message);
    }
  }

  if (!assigneesResponse.ok) {
    const err = await assigneesResponse.json();
    throw new Error(err.message);
  }

  const assignees: AllowanceUser[] = await assigneesResponse.json();

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
            <h1>
              Task Template: <span className="highlight">add</span>
            </h1>
            <Link href="/templates">
              <button>Templates Table</button>
            </Link>
          </div>
        </div>
        <hr className={`page-title`} />
        <div className="banner">
          Templates are used to create recurring tasks.
        </div>
        <div className="card-title">
          <h2>Add Task Template</h2>
        </div>

        <Suspense fallback={<Loading />}>
          <div className="card">
            <TemplateForm
              csrf={csrf}
              slug={null}
              assignees={assignees}
              template={null}
              templateFormUpdate={templateFormUpdate}
            />
          </div>
        </Suspense>
      </main>
    </>
  );
}
