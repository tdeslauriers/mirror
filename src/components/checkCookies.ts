"use server";

import { cookies } from "next/headers";
import GetOauthExchange from "./oauth-exchange";
import { redirect } from "next/navigation";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { checkUuid } from "@/validation/user_fields";

export type UiCookies = {
  identity: RequestCookie | null | undefined;
  session: RequestCookie | null | undefined;
};

// checks for identity cookie and if does not exist, redirects to login,
// and sets the state var to the current page.
export async function checkForIdentityCookie(page: string) {
  const cookieStore = await cookies();

  // identity cookie
  const hasIdentity = cookieStore.has("identity")
    ? cookieStore.get("identity")
    : null;

  // session cookie
  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;

  // check session cookie exists
  if (!hasSession) {
    console.log(`Failed to load ${page} page: session cookie is missing`);
    throw new Error(`Failed to load ${page} page: session cookie is missing`);
  }

  const checkSession = checkUuid(hasSession?.value);
  if (!checkSession.isValid) {
    throw new Error(`Failed to load ${page} page: session cookie is invalid`);
  }

  // if identity cookie is missing, redirect to login page
  if (!hasIdentity) {
    const oauth = await GetOauthExchange(hasSession?.value, page);
    if (oauth) {
      redirect(
        `/login?client_id=${oauth.client_id}&response_type=${oauth.response_type}&state=${oauth.state}&nonce=${oauth.nonce}&redirect_url=${oauth.redirect_url}`
      );
    } else {
      redirect("/login");
    }
  }

  return { identity: hasIdentity, session: hasSession } as UiCookies;
}

export async function checkForSessionCookie() {
  const cookieStore = await cookies();

  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;

  if (!hasSession) {
    throw new Error(
      "Session cookie is missing.  This value is required and cannot be tampered with."
    );
  }

  const checkSession = checkUuid(hasSession?.value);
  if (!checkSession.isValid) {
    throw new Error(
      "Session cookie is invalid.  This value is required and cannot be tampered with."
    );
  }

  return hasSession;
}
