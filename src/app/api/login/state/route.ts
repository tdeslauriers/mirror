import { NextRequest, NextResponse } from "next/server";
import {
  GatewayError,
  OauthExchange,
  isGatewayError,
  isValidSessionId,
} from "../..";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

export async function GET(req: NextRequest) {
  const session: RequestCookie | undefined = req.cookies.get("session_id");

  if (session?.value && isValidSessionId(session.value)) {
    // call gateway oauth state + nonce endpoint
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    try {
      const apiResponse = await fetch("https://localhost:8443/oauth/state", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session_token: session.value }),
      });

      if (apiResponse.ok) {
        const success: OauthExchange = await apiResponse.json();

        return NextResponse.json(success, {
          headers: {
            "Cache-Control": "no-store",
          },
        });
      } else {
        const fail = await apiResponse.json();
        if (isGatewayError(fail)) {
          const errors = handleOauthErrors(fail);
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
  } else {
    throw new Error("Session cookie not found.");
  }
}

function handleOauthErrors(gatewayError: GatewayError) {
  const errors: { [key: string]: string[] } = {};
  errors.server = [
    gatewayError.message || "An error occurred. Please try again.",
    "If the problem persists, please contact me.",
  ];
  return errors;
}
