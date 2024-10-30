import {
  GatewayError,
  isGatewayError,
  isValidSessionId,
  OauthExchange,
} from "@/app/api";

const errMsg: string =
  "An error occurred setting up the oauth 2 variables for the login page. Please try again. If the problem persists, please contact me.";

export default async function GetOauthExchange(session: string) {
  // check for session (should never happen)
  if (!session || session.length <= 0) {
    console.log("No session token provided to get oauth fucntion.");
    throw new Error("Session token required to get csrf token.");
  }

  if (isValidSessionId(session)) {
    // call gateway oauth state + nonce endpoint
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    try {
      const apiResponse = await fetch("https://localhost:8443/oauth/state", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session_token: session }),
      });

      if (apiResponse.ok) {
        const success: OauthExchange = await apiResponse.json();
        return success;
      } else {
        const fail = await apiResponse.json();
        if (isGatewayError(fail)) {
          const errors = handleOauthErrors(fail);
          handleOauthErrors(fail);
        } else {
          throw new Error(
            "An error occurred. Please try again. If the problem persists, please contact me."
          );
        }
      }
    } catch (error: any) {
      console.log("Error fetching oauth exchange");
      throw new Error(errMsg);
    }
  } else {
    throw new Error("Session cookie not found.");
  }
}

function handleOauthErrors(gatewayError: GatewayError) {
  console.log(
    `A gateway error occurred calling oauth state endpoint ( ${gatewayError.code}: ${gatewayError.message}`
  );
  throw new Error(errMsg);
}
