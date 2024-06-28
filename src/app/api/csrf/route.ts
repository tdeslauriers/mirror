import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { GatewayError, isGatewayError } from "..";

export async function GET(req: NextRequest) {
  // get session_id cookie to be url param for gateway csrf endpoint
  // session_id will have been set by middleware on render of csrf-sourcing page
  // TODO: add error handling for missing session_id cookie
  const sessionId = cookies().get("session_id");

  // call gateway csrf endpoint
  if (sessionId && validateSessionId(sessionId.value)) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    try {
      const apiResponse = await fetch(
        `https://localhost:8443/csrf/${sessionId.value}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (apiResponse.ok) {
        const success = await apiResponse.json();
        return NextResponse.json(success, {
          headers: {
            "Cache-Control": "no-store",
          },
        });
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
  }
}

// validate session_id: super light-weight, just check for absurd tampering
function validateSessionId(sessionId: string) {
  if (!sessionId.length || sessionId.length < 16 || sessionId.length > 64) {
    return false;
  }
  return true;
}

function handleCsrfErrors(gatewayError: GatewayError) {
  const errors: { [key: string]: string[] } = {};
  errors.server = [
    gatewayError.message || "An error occurred. Please try again.",
    "If the problem persists, please contact me.",
  ];
  return errors;
}
