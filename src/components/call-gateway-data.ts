"use server";

import { GatewayError } from "@/app/api";

export type GatewayResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: GatewayError };

// makes a call to the gateway service endpoint to retrieve data used in page rendering.
// Note: this is only for GET requests and does not handle POST, PUT, DELETE, etc.
export default async function callGatewayData<T>({
  endpoint,
  searchParams,
  session,
}: {
  endpoint: string;
  searchParams?: Record<string, string>;
  session: string | null | undefined;
}): Promise<GatewayResult<T>> {
  // check for endpoint value because it's required
  if (!endpoint || endpoint.trim().length === 0) {
    return {
      ok: false,
      error: {
        code: 500,
        message:
          "Internal server error: endpoint is required when calling the gateway service.",
      },
    };
  }

  if (searchParams && Object.keys(searchParams).length > 0) {
    // check if searchParams is an Record<key, value>
    if (typeof searchParams !== "object") {
      return {
        ok: false,
        error: {
          code: 500,
          message:
            "Internal server error: searchParams must be an object of key/value pairs.",
        },
      };
    }

    // check if searchParams is empty
    if (Object.keys(searchParams).length === 0) {
      return {
        ok: false,
        error: {
          code: 500,
          message:
            "Internal server error: searchParams cannot be an empty object.",
        },
      };
    }
  }

  // check for session value
  if (!session || session.trim().length === 0) {
    return {
      ok: false,
      error: {
        code: 401,
        message:
          "Unauthorized: session token is required when calling the gateway service.",
      },
    };
  }

  try {
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

    const text = await response.text();
    const json = text ? (JSON.parse(text) as unknown) : (undefined as unknown);

    if (!response.ok) {
      const code = (json as any)?.code ?? response.status;
      const message =
        (json as any)?.message ??
        (json as any)?.error ??
        response.statusText ??
        "An error occurred when calling the gateway service.";

      return { ok: false, error: { code, message } };
    }

    return { ok: true, data: json as T };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown/unhandled error occurred";
    return { ok: false, error: { code: 500, message } };
  }
}
