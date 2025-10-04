import callGatewayData, { GatewayResult } from "./call-gateway-data";

export type CsrfToken = {
  session_token: string;
  csrf_token: string;
  created_at: Date;
  authenticated: boolean;
};

// gets a CSRF token from the gateway service for the provided session token
export default async function GetCsrf(
  session: string
): Promise<GatewayResult<CsrfToken>> {
  // check for session (should never happen)
  if (!session || session.length <= 0) {
    console.log("No session token provided to get csrf fucntion.");
    return {
      ok: false,
      error: {
        code: 401,
        message: "No session token provided to get csrf function.",
      },
    };
  }

  if (isValidSessionId(session)) {
    return await callGatewayData<CsrfToken>({
      endpoint: `/session/csrf/${session}`,
      session: session,
    });
  } else {
    return {
      ok: false,
      error: {
        code: 400,
        message: "Invalid session token provided to get csrf function.",
      },
    };
  }
}

// validate session_id: super light-weight, just check for absurd tampering
export function isValidSessionId(session: string) {
  if (!session.length || session.length < 16 || session.length > 64) {
    return false;
  }
  return true;
}
