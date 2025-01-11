import { GatewayError, isGatewayError } from "@/app/api";
// import fetch from "../setupFetch";

const errMsg: string =
  "Failed to retrieve CSRF token.  Please try again by either clicking 'Try Again' or refreshing the page. If the problem persists, please contact me.";

export default async function GetCsrf(session: string) {
  // check for session (should never happen)
  if (!session || session.length <= 0) {
    console.log("No session token provided to get csrf fucntion.");
    throw new Error("Session token required to get csrf token.");
  }

  if (isValidSessionId(session)) {
    try {
      const apiResponse = await fetch(
        `${process.env.GATEWAY_SERVICE_URL}/session/csrf/${session}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (apiResponse.ok) {
        const success = await apiResponse.json();
        return success.csrf_token as string;
      } else {
        const fail = await apiResponse.json();
        if (isGatewayError(fail)) {
          handleCsrfErrors(fail);
          throw new Error(errMsg);
        } else {
          throw new Error(errMsg);
        }
      }
    } catch (error: any) {
      console.log(error.message);
      throw new Error(error);
    }
  } else {
    throw new Error("Invalid session token.");
  }
}

// validate session_id: super light-weight, just check for absurd tampering
export function isValidSessionId(session: string) {
  if (!session.length || session.length < 16 || session.length > 64) {
    return false;
  }
  return true;
}

function handleCsrfErrors(gatewayError: GatewayError) {
  console.log(
    `A gateway error occurred calling csrf endpoint ( ${gatewayError.code}: ${gatewayError.message}`
  );
  throw new Error(errMsg);
}
