import { checkUuid } from "@/validation/fields";
import { NextRequest, NextResponse } from "next/server";
import { Credentials, GatewayError, isGatewayError } from "..";

export type LoginCmd = {
  username: string;
  password: string;
  response_type: string;
  state: string;
  nonce: string;
  client_id: string;
  redirect: string;
};

export async function POST(req: NextRequest) {
  // field validation
  const errors: { [key: string]: string[] } = {};

  // check oauth query params
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
    errors.oauth.push("Redirect url query param is missing or too short.");
  }

  // check credentials --> very light weight validation
  const credentials: Credentials = await req.json();
  if (credentials.username.trim().length > 254) {
    console.log("username less than 254 characters.");
    errors.username = ["Email/username must be less than 254 characters."];
  }
  if (credentials.password.trim().length > 64) {
    console.log("password less than 64 characters.");
    errors.password = ["Password must be less than 64 characters."];
  }

  // return field level errors to login page
  if (errors && Object.keys(errors).length > 0) {
    return NextResponse.json(errors, {
      status: 422,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // build login cmd
  const loginCmd = {
    username: credentials.username,
    password: credentials.password,
    response_type: response_type,
    state: state,
    nonce: nonce,
    client_id: client_id,
    redirect: redirect,
  };

  // post to gateway login endpoint
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  try {
    const apiResponse = await fetch("https://localhost:8443/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginCmd),
    });

    if (apiResponse.ok) {
      const success = await apiResponse.json();

      // TODO: handle redirect to oauth callback url
      console.log("login success: ", success);
      return NextResponse.json(success, {
        status: apiResponse.status,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleLoginErrors(fail);
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

function handleLoginErrors(gatewayError: GatewayError) {
  console.log("login gateway error: ", gatewayError);
  const errors: { [key: string]: string[] } = {};
}
