import { NextRequest, NextResponse } from "next/server";

export type OauthExchange = {
  nonce: string | null;
  state: string | null;
  redirect_url: string | null;
  created_at: string | null;
};

export async function GET(req: NextRequest) {
  // call gateway oauth state + nonce endpoint
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  try {
    const apiResponse = await fetch("https://localhost:8443/oauth/state", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

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
        const errors = handleGatewayErrors(fail);
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

export type GatewayError = {
  code: number;
  message: string;
};

function isGatewayError(object: any): object is GatewayError {
  return (
    object &&
    typeof object.code === "number" &&
    typeof object.message === "string"
  );
}

function handleGatewayErrors(gatewayError: GatewayError) {
  const errors: { [key: string]: string[] } = {};
  errors.server = [
    gatewayError.message || "An error occurred. Please try again.",
    "If the problem persists, please contact me.",
  ];
  return errors;
}
