import { isGatewayError, GatewayError } from "./app/api";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const response: NextResponse = NextResponse.next();

  // check for session cookie
  const sessionId = cookies().get("session_id");
  if (!sessionId || sessionId.value === "") {
    // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // must be at top of page that calls this middleware
    try {
      const apiResponse = await fetch(
        "https://localhost:8443/session/anonymous",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (apiResponse.ok) {
        const success = await apiResponse.json();

        // session id cookie
        response.cookies.set("session_id", success.session_token, {
          httpOnly: true,
          sameSite: "strict",
          secure: true,
          maxAge: 60 * 60,
        });

        // auth status cookie --> convenience for UI rendering, not used for actual auth logic
        // '/session/anonymous' endpoint called by this middleware ALWAYS returns authenticated: false
        response.cookies.set("authenticated", success.authenticated, {
          httpOnly: false,
          sameSite: "strict",
          secure: true,
          maxAge: 60 * 60,
        });

        return response;
      } else {
        const fail = await apiResponse.json();
        if (isGatewayError(fail)) {
          console.log("response from 'session/anonymous' failed: ", fail);
          const errors = handleGetSessionErrors(fail);

          return NextResponse.json(errors, {
            status: apiResponse.status,
            headers: {
              "Content-Type": "application/json",
            },
          });
        } else {
          throw new Error(
            "An error occurred fetching anonymous session data. Please try again. If the problem persists, please contact me."
          );
        }
      }
    } catch (error: any) {
      console.log("unhandled error fetching anonymous session data: ", error);
      return response;
    }
  }

  return response;
}

function handleGetSessionErrors(gatewayError: GatewayError) {
  const errors: { [key: string]: string[] } = {};
  switch (gatewayError.code) {
    case 400:
      errors.badrequest = [gatewayError.message];
      return errors;

    case 405:
      errors.badrequest = [gatewayError.message];
      return errors;

    default:
      errors.server = [
        gatewayError.message ||
          "An error occurred fetching anonymous session data. Please try again.",
        "If the problem persists, please contact me.",
      ];
      return errors;
  }
}
