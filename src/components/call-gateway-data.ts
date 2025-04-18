"use server";

import { redirect } from "next/navigation";
import GetOauthExchange from "./oauth-exchange";
import { headers } from "next/headers";

// makes a call to the gateway service endpoint to retrieve data used in page rendering.
// Note: this is only for GET requests and does not handle POST, PUT, DELETE, etc.
export default async function callGatewayData({
  endpoint,
  searchParams,
  session,
}: {
  endpoint: string;
  searchParams?: Record<string, string>;
  session: string | null | undefined;
}) {
  // check for endpoint value because it's required
  if (!endpoint || endpoint.trim().length === 0) {
    throw new Error("Endpoint is required.");
  }

  if (searchParams && Object.keys(searchParams).length > 0) {
    // check if searchParams is an Record<key, value>
    if (typeof searchParams !== "object") {
      throw new Error("searchParams must be an object.");
    }
    // check if searchParams is empty
    if (Object.keys(searchParams).length === 0) {
      throw new Error("searchParams cannot be empty.");
    }
  }

  // check for session value
  if (!session || session.trim().length === 0) {
    throw new Error("Session cookie is missing.");
  }

  // build the URL
  const url = new URL(endpoint, process.env.GATEWAY_SERVICE_URL);
  // add the search params to the URL if they exist
  if (searchParams) {
    url.search = new URLSearchParams(searchParams).toString();
  }

  // call the gateway to get the data
  const response = await fetch(url.toString(), {
    headers: {
      Authorization: session,
    },
  });

  if (!response.ok) {
    const fail = await response.json();

    console.log(fail);
    throw new Error(fail.message);
  }

  return response.json();
}
