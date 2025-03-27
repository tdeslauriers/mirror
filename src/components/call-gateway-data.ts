"use server";

import { redirect } from "next/navigation";
import GetOauthExchange from "./oauth-exchange";
import { headers } from "next/headers";

// makes a call to the gateway service endpoint to retrieve data used in page rendering.
// Note: this is only for GET requests and does not handle POST, PUT, DELETE, etc.
export default async function callGatewayData(
  endpoint: string,
  session: string | null | undefined
) {
  // check for endpoint value because it's required
  if (!endpoint || endpoint.trim().length === 0) {
    throw new Error("Endpoint is required.");
  }

  // check for session value
  if (!session || session.trim().length === 0) {
    throw new Error("Session cookie is missing.");
  }

  // call the gateway to get the data
  const response = await fetch(process.env.GATEWAY_SERVICE_URL + endpoint, {
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
