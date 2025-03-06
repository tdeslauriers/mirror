// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import GetCsrf from "@/components/csrf-token";
import LoginForm from "./login-form";
import { OauthExchange } from "../api";
import GetOauthExchange from "@/components/oauth-exchange";
import { pageError } from ".";
import Loading from "@/components/loading";
import Link from "next/link";

export const metadata = {
  robots: "noindex, nofollow",
};

interface LoginParams {
  response_type?: string;
  state?: string;
  nonce?: string;
  client_id?: string;
  redirect_url?: string;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: LoginParams | any;
}) {
  // light weight cookie check if the user has authenticated cookies and redirect to "/" if true
  // quick redirect if auth'd cookies are present:
  // only unauthenticated users should be able to register
  const cookieStore = await cookies();

  const hasIdentity = cookieStore.has("identity")
    ? cookieStore.get("identity")
    : null;

  if (hasIdentity) {
    console.log("User has authenticated cookies. Redirecting to home.");
    redirect("/");
  }

  // get csrf token from gateway for login form
  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;
  if (!hasSession) {
    console.log("Session cookie is missing");
    throw new Error(pageError);
  }
  const csrf = await GetCsrf(hasSession.value);

  if (!csrf) {
    console.log("CSRF token could not be retrieved.");
    throw new Error(
      "Failed to load login page: CSRF token could not be retrieved."
    );
  }

  // get oauth exchange params from gateway for login form
  const resolvedParams = await Promise.resolve(searchParams);
  const response_type = resolvedParams.response_type;
  const state = resolvedParams.state;
  const nonce = resolvedParams.nonce;
  const client_id = resolvedParams.client_id;
  const redirect_url = resolvedParams.redirect_url;

  let oauth: OauthExchange = {};
  if (!response_type || !state || !nonce || !client_id || !redirect_url) {
    oauth = (await GetOauthExchange(hasSession.value)) || {};
  } else {
    oauth = {
      response_type: response_type,
      state: state,
      nonce: nonce,
      client_id: client_id,
      redirect_url: redirect_url,
    };
  }

  return (
    <>
      <main className={`main`}>
        <div className={`center`}></div>
        <h1>
          <span className={`highlight`}>Login</span> to view restricted content.
        </h1>
        <Suspense fallback={<Loading />}>
          <div className={`card`}>
            <LoginForm csrf={csrf} oauth={oauth} />
          </div>
        </Suspense>
      </main>
    </>
  );
}
