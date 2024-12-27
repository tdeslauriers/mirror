import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { GatewayError, isGatewayError, isValidSessionId } from "..";

export async function GET(req: NextRequest) {
  // get session_id cookie to be url param for gateway csrf endpoint
  // session_id will have been set by middleware on render of csrf-sourcing page
  // TODO: add error handling for missing session_id cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session_id");

  // call gateway csrf endpoint
  if (sessionCookie && isValidSessionId(sessionCookie.value)) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    try {
      const apiResponse = await fetch(
        `${process.env.GATEWAY_SERVICE_URL}:${process.env.GATEWAY_SERVICE_PORT}/session/csrf/${sessionCookie.value}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (apiResponse.ok) {
        const success = await apiResponse.json();

        // validate session token came back.
        // mismatch should never happen. if it does, it's a security issue.
        if (sessionCookie.value !== success.session_token) {
          return NextResponse.json(
            { server: ["Session token mismatch. Please try again."] },
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }
        // IMPORTANT: do not return session_token to client. XSS!
        return NextResponse.json(
          { csrf_token: success.csrf_token, created_at: success.created_at },
          {
            headers: {
              "Cache-Control": "no-store",
            },
          }
        );
      } else {
        const fail = await apiResponse.json();
        if (isGatewayError(fail)) {
          const errors = handleCsrfErrors(fail);
          return NextResponse.json(errors, {
            status: apiResponse.status,
            headers: {
              "Content-Type": "application/json",
            },
          });
        } else {
          throw new Error(
            "An error occurred. Please try again. If the problem persists, please contact me."
          );
        }
      }
    } catch (error: any) {
      return NextResponse.json(
        { server: [error.message] },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } // TODO: add error handling for missing/invalid session_id cookie
}

function handleCsrfErrors(gatewayError: GatewayError) {
  const errors: { [key: string]: string[] } = {};
  errors.server = [
    gatewayError.message || "An error occurred. Please try again.",
    "If the problem persists, please contact me.",
  ];
  return errors;
}
