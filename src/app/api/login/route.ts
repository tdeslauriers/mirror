import { checkUuid } from "@/validation/fields";
import { NextRequest, NextResponse } from "next/server";
import {
  CallbackCmd,
  CallbackUrl,
  Credentials,
  ErrMsgGeneric,
  GatewayError,
  LoginCmd,
  isGatewayError,
  isValidSessionId,
} from "..";
import { cookies, headers } from "next/headers";

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
  if (credentials.username && credentials.username.trim().length > 254) {
    console.log("username less than 254 characters.");
    errors.username = ["Email/username must be less than 254 characters."];
  }
  if (credentials.password && credentials.password.trim().length > 64) {
    console.log("password less than 64 characters.");
    errors.password = ["Password must be less than 64 characters."];
  }
  if (
    !credentials.csrf ||
    credentials.csrf.length < 16 ||
    credentials.csrf.length > 64
  ) {
    console.log("csrf token missing or not well formed.");
    errors.csrf = [ErrMsgGeneric];
  }

  // get session_id cookie to pass to gateway login endpoint
  const sessionCookie = cookies().get("session_id");
  if (!sessionCookie || !isValidSessionId(sessionCookie.value)) {
    console.log("session_id cookie is missing or not well formed.");
    errors.server = [ErrMsgGeneric];
  }

  // build login cmd
  const loginCmd: LoginCmd = {
    username: credentials.username,
    password: credentials.password,

    response_type: response_type,
    state: state,
    nonce: nonce,
    client_id: client_id,
    redirect: redirect,

    csrf: credentials.csrf,
    session: sessionCookie?.value,
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
      const cmd: CallbackCmd = await apiResponse.json();

      // session will not be in payload, but check/remove anyway
      if (cmd.session) {
        delete cmd.session;
      }

      // TODO: add validation to the cmd values.

      // return response to the login page: will create redirect to callback page
      return NextResponse.json(cmd, {
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
        console.log(fail);
        return NextResponse.json(fail, {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        });
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
  const errors: { [key: string]: string[] } = {};
  switch (gatewayError.code) {
    case 400:
      errors.badrequest = [gatewayError.message];
      return errors;
    case 401:
      if (gatewayError.message.includes(";")) {
        const errMsgs: string[] = gatewayError.message.split(";");
        errMsgs.forEach((msg) => {
          switch (true) {
            case msg.includes("username or password"):
              errors.credentials = [msg];
              break;
            case msg.includes("redirect url"):
              errors.redirect = [msg];
              break;
            case msg.includes("client Id"):
              errors.client_id = [msg];
              break;
            case msg.includes("response type"):
              errors.response_type = [msg];
              break;
            default:
              errors.server = [msg];
              break;
          }
        });
        return errors;
      } else {
        errors.server = [gatewayError.message];
        return errors;
      }
    case 405:
      errors.badrequest = [gatewayError.message];
      return errors;
    case 422:
      // these checks are very light weight
      switch (true) {
        case gatewayError.message.includes("username"):
          errors.username = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("password"):
          errors.password = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("response type"):
          errors.response_type = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("state"):
          errors.state = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("nonce"):
          errors.nonce = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("redirect"):
          errors.redirect = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("client id"):
          errors.client_id = [gatewayError.message];
          return errors;
        default:
          break;
      }
    default:
      errors.server = [
        gatewayError.message ||
          "A login error occurred. Please try refreshing the page loggin in again.",
        "If the problem persists, please contact me.",
      ];
      return errors;
  }
}
