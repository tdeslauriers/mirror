import { checkUuid } from "@/validation/fields";
import { NextRequest, NextResponse } from "next/server";
import { CallbackCmd, GatewayError } from "../..";

export async function POST(req: NextRequest) {
  // field validation
  const errors: { [key: string]: string[] } = {};

  // check callback query params
  const { searchParams } = req.nextUrl;

  const response_type = searchParams.get("response_type");
  if (
    !response_type ||
    response_type.trim().length < 3 ||
    response_type.trim().length > 10
  ) {
    console.log(
      "response type url query param missing,too short, or too long."
    );
    errors.oauth.push(
      "response_type url query param missing,too short, or too long."
    );
  }

  const state = searchParams.get("state");
  if (!state || !checkUuid(state).isValid) {
    console.log("state url query param either missing or not well formed uuid");
    errors.oauth.push("State url query param must be a valid UUID.");
  }
  const nonce = searchParams.get("nonce");
  if (!nonce || !checkUuid(nonce).isValid) {
    console.log("nonce url query param either missing or not well formed uuid");
    errors.oauth.push("Nonce url query param must be a valid UUID.");
  }

  const client_id = searchParams.get("client_id");
  if (!client_id || !checkUuid(client_id).isValid) {
    console.log(
      "client_id url query param either missing or not well formed uuid"
    );
    errors.oauth.push("Client_id url query param must be a valid UUID.");
  }

  // redirect check is simple because will be checked against registered redirect urls by auth service
  const redirect = searchParams.get("redirect_url");
  if (!redirect || redirect.trim().length < 11) {
    console.log(
      "redirect url query param missing or too short for a valid url."
    );
    errors.oauth.push(
      "Redirect url query param missing or too short for a valid url."
    );
  }

  // check for auth code
  const auth_code = searchParams.get("auth_code");
  if (!auth_code || !checkUuid(auth_code).isValid) {
    console.log("auth url query param either missing or not well formed uuid");
    errors.oauth.push("State url query param must be a valid UUID.");
  }

  // return field level errors to error page
  // TODO: build error page to receive and display errors in redirect flow

  const cmd: CallbackCmd = {
    auth_code,
    response_type,
    state,
    nonce,
    client_id,
    redirect,
  };

  // post to gateway callback endpoint
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  try {
    const apiResponse = await fetch(
      "https://localhost:8443/oauth/token/callback",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cmd),
      }
    );
    if (apiResponse.ok) {
      // TODO: handle redirect to home or restricted url content
    } else {
      const fail = await apiResponse.json();
      // TODO: Redirect to error page
    }
  } catch (error) {
    // TODO: handle network error
    // redirect to error page
  }
}

function handleCallbackErrors(gatewayError: GatewayError) {
  const errors: { [key: string]: string[] } = {};
  // TODO: handle gateway errors
  return errors;
}
