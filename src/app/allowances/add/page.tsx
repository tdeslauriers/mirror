import GetCsrf from "@/components/csrf-token";
import Loading from "@/components/loading";
import GetOauthExchange from "@/components/oauth-exchange";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AddAllowanceForm from "./add-allowance-form";
import { User } from "@/app/users";

export const metadata = {
  robots: "noindex, nofollow",
};

interface UserJson {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  slug: string;
  created_at: string;
  birth_date: string;
  enabled: boolean;
  account_expired: boolean;
  account_locked: boolean;
}

const pageError = "Failed to load allowance add page: ";

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
    const oauth = await GetOauthExchange(hasSession?.value, `/allowances/add`);
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

  // get user data from gateway
  const response = await fetch(`${process.env.GATEWAY_SERVICE_URL}/users`, {
    headers: {
      Authorization: `${hasSession?.value}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      const oauth = await GetOauthExchange(hasSession?.value, "/users");
      if (oauth) {
        redirect(
          `/login?client_id=${oauth.client_id}&response_type=${oauth.response_type}&state=${oauth.state}&nonce=${oauth.nonce}&redirect_url=${oauth.redirect_url}`
        );
      } else {
        redirect("/login");
      }
    } else {
      const err = await response.json();
      throw new Error(err.message);
    }
  }

  const userJson: UserJson[] = await response.json();
  // need to loop thru and build the dobs for the form
  const users: User[] = userJson.map((u) => {
    const dob = new Date(u.birth_date);

    return {
      firstname: u.firstname,
      lastname: u.lastname,
      slug: u.slug,
      created_at: u.created_at,
      enabled: u.enabled,
      account_expired: u.account_expired,
      account_locked: u.account_locked,
      birth_month: dob.getMonth() ? dob.getMonth() : undefined,
      birth_day: dob.getDate() ? dob.getDate() : undefined,
      birth_year: dob.getFullYear() ? dob.getFullYear() : undefined,
    };
  });

  return (
    <>
      <main className="main main-drawer">
        <div className="center">
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
                Allowances: <span className="highlight">add account</span>
              </h1>
              <Link href="/allowances">
                <button>Allowances Table</button>
              </Link>
            </div>
          </div>
          <hr className="page-title" />
        </div>
        <div className="card-title">
          <h2>New Account</h2>
        </div>
        <div className="card">
          <Suspense fallback={<Loading />}>
            <AddAllowanceForm csrf={csrf} users={users} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
