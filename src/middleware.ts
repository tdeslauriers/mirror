import { isGatewayError, GatewayError } from "./app/api";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const response: NextResponse = NextResponse.next();

  // check for session cookie
  const cookieStore = await cookies();
  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;

  // if session cookie is missing, fetch anonymous session data
  if (!hasSession || hasSession.value === "") {
    try {
      const apiResponse = await fetch(
        `${process.env.GATEWAY_SERVICE_URL}/session/anonymous`,
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
      console.log(
        "unhandled error fetching anonymous session data: ",
        error.message
      );
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
