import GetCsrf from "@/components/csrf-token";
import GetOauthExchange from "@/components/oauth-exchange";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { User } from "..";
import Link from "next/link";
import { Suspense } from "react";
import UserForm from "@/components/forms/user-form";
import Loading from "@/components/loading";
import { handleScopesUpdate, handleUserEdit } from "./actions";
import ScopesManageForm from "@/components/forms/scopes-manage-form";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load user page.";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // get slug param from url
  const slug = (await params).slug;

  // quick for redirect if auth'd cookies not present
  const cookieStore = await cookies();
  const hasIdentity = cookieStore.has("identity")
    ? cookieStore.get("identity")
    : null;
  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;

  if (!hasIdentity) {
    const oauth = await GetOauthExchange(hasSession?.value, `/users/${slug}`);
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
    console.log(`${pageError} session cookie is missing`);
    throw new Error(`${pageError} session cookie is missing`);
  }

  // get csrf token from gateway for user form
  const csrf = await GetCsrf(hasSession.value);

  if (!csrf) {
    console.log(
      `${pageError} CSRF token could not be retrieved for user ${slug}.`
    );
    throw new Error(
      `${pageError} CSRF token could not be retrieved for user ${slug}.`
    );
  }

  // get client record data from gateway
  const userResopnse = await fetch(
    `${process.env.GATEWAY_SERVICE_URL}/users/${slug}`,
    {
      headers: {
        Authorization: `${hasSession?.value}`,
      },
    }
  );

  if (!userResopnse.ok) {
    if (userResopnse.status === 401) {
      const oauth = await GetOauthExchange(hasSession?.value, `/users/${slug}`);
      if (oauth) {
        redirect(
          `/login?client_id=${oauth.client_id}&response_type=${oauth.response_type}&state=${oauth.state}&nonce=${oauth.nonce}&redirect_url=${oauth.redirect_url}`
        );
      } else {
        redirect("/login");
      }
    } else {
      const fail = await userResopnse.json();
      throw new Error(fail.message);
    }
  }

  const user = await userResopnse.json();

  // get scopess data from gateway for scopes dropdown
  const scopesResponse = await fetch(
    `${process.env.GATEWAY_SERVICE_URL}/scopes`,
    {
      headers: {
        Authorization: `${hasSession?.value}`,
      },
    }
  );

  if (!scopesResponse.ok) {
    if (scopesResponse.status === 401) {
      const oauth = await GetOauthExchange(hasSession?.value, `/users/${slug}`);
      if (oauth) {
        redirect(
          `/login?client_id=${oauth.client_id}&response_type=${oauth.response_type}&state=${oauth.state}&nonce=${oauth.nonce}&redirect_url=${oauth.redirect_url}`
        );
      } else {
        redirect("/login");
      }
    } else {
      const fail = await scopesResponse.json();
      throw new Error(fail.message);
    }
  }

  const allScopes = await scopesResponse.json();

  return (
    <>
      <main className={`main main-drawer`}>
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
              User: <span className="highlight">{user?.username}</span>
            </h1>
            <Link href={`/users`}>
              <button>Users Table</button>
            </Link>
          </div>
        </div>
        <hr className="page-title" />
        {user?.created_at && (
          <div className="banner">
            Registered since{" "}
            {new Date(user.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        )}
        <div className="card-title">
          <h2>Uuid: {<span className="highlight">{user?.id}</span>}</h2>
          <h2>Slug: {<span className="highlight">{user?.slug}</span>}</h2>
        </div>
        <div className={`card`}>
          <Suspense fallback={<Loading />}>
            <UserForm
              csrf={csrf}
              slug={slug}
              profile={user}
              userEdit={handleUserEdit}
            />
          </Suspense>
        </div>

        <div className="card-title">
          <h2>
            Scopes:{" "}
            <sup>
              <span className="highlight-info" style={{ fontSize: ".65em" }}>
                * must click &lsquo;Update Scopes&lsquo; to save changes
              </span>
            </sup>
          </h2>
        </div>
        <div className="card">
          <Suspense fallback={<Loading />}>
            <ScopesManageForm
              csrf={csrf}
              slug={slug}
              entityScopes={user?.scopes}
              menuScopes={allScopes}
              updateScopes={handleScopesUpdate}
            />
          </Suspense>
        </div>
      </main>
    </>
  );
}
