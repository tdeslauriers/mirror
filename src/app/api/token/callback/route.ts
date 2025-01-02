import {
  CallbackResponse,
  IdentityCookie,
  isGatewayError,
} from "./../../index";
import { checkUuid } from "@/validation/fields";
import { NextRequest, NextResponse } from "next/server";
import {
  CallbackCmd,
  ErrMsgGeneric,
  GatewayError,
  isValidSessionId,
} from "../..";
import { cookies } from "next/headers";
export async function POST(req: NextRequest) {
  // field validation
  const errors: { [key: string]: string[] } = {};

  const cookieStore = await cookies();
  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;

  if (hasSession && isValidSessionId(hasSession.value)) {
    // check oauth query params
    const { searchParams } = req.nextUrl;

    const response_type = searchParams.get("response_type");
    if (
      !response_type ||
      response_type.trim().length < 3 ||
      response_type.trim().length > 10
    ) {
      console.log(
        "'response type' url query param missing,too short, or too long."
      );
      errors.oauth.push(
        "'response_type' callback url query param missing,too short, or too long."
      );
    }

    const state = searchParams.get("state");
    if (!state || state.trim().length <= 0 || state.trim().length > 256) {
      console.log(
        "'state' callback url query param either missing or not well formed."
      );
      errors.oauth.push(
        "'state' callback url query param either missing or not well formed."
      );
    }
    const nonce = searchParams.get("nonce");
    if (!nonce || !checkUuid(nonce).isValid) {
      console.log(
        "'nonce' callback url query param either missing or not well formed."
      );
      errors.oauth.push(
        "'nonce' callback url query param either missing or not well formed."
      );
    }

    const client_id = searchParams.get("client_id");
    if (!client_id || !checkUuid(client_id).isValid) {
      console.log(
        "'client_id' url query param either missing or not well formed."
      );
      errors.oauth.push(
        "Client_id url query param either missing or not well formed."
      );
    }

    // redirect check is simple because will be checked against registered redirect urls by auth service
    const redirectUrl = searchParams.get("redirect_url");
    if (!redirectUrl || redirectUrl.trim().length < 11) {
      console.log(
        "'redirect_url' callback url query param missing or too short for a valid url."
      );
      errors.oauth.push(
        "redirect_url' callback query param missing or too short for a valid url."
      );
    }

    // check for auth code
    const auth_code = searchParams.get("auth_code");

    if (!auth_code || !checkUuid(auth_code).isValid) {
      console.log(
        "'auth_code' callback url query param either missing or not well formed."
      );
      errors.oauth.push(
        "'auth_code' callback url query param either missing or not well formed."
      );
    }

    // return field level errors to error page
    // TODO: build error page to receive and display errors in redirect flow

    const cmd: CallbackCmd = {
      session: hasSession.value,

      auth_code,
      response_type,
      state,
      nonce,
      client_id,
      redirect: redirectUrl,
    };

    // post to gateway callback endpoint
    // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    try {
      const apiResponse = await fetch(
        `${process.env.GATEWAY_SERVICE_URL}:${process.env.GATEWAY_SERVICE_PORT}/oauth/callback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cmd),
        }
      );
      if (apiResponse.ok) {
        // handle redirect to home or restricted url content
        const callback: CallbackResponse = await apiResponse.json();

        // set session cookies
        if (callback.session && callback.session.length > 0) {
          cookieStore.set("session_id", callback.session, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
            maxAge: 60 * 60,
          });
        } else {
          console.log("failed to upgrade session cookie");
        }

        // set identity cookie
        const user: IdentityCookie = {
          username: callback.username,
          fullname: callback.fullname,
          given_name: callback.given_name,
          family_name: callback.family_name,
          ux_render: callback.ux_render,
        };

        if (callback.birthdate) {
          user.birthdate = callback.birthdate;
        }

        cookieStore.set("identity", JSON.stringify(user), {
          httpOnly: false,
          sameSite: "strict",
          secure: true,
          maxAge: 60 * 60,
        });
        return NextResponse.json(
          { status: "success" },
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        const fail = await apiResponse.json();
        if (isGatewayError(fail)) {
          const errors = handleCallbackErrors(fail);
          // TODO: handle network error
          // redirect to error page: for now just send error back to login page
          return NextResponse.json(errors, {
            status: apiResponse.status,
            headers: {
              "Content-Type": "application/json",
            },
          });
        } else {
          throw new Error(ErrMsgGeneric);
        }
      }
    } catch (error: any) {
      // TODO: handle network error
      // redirect to error page: for now just send error back to callback page
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
    console.log("session_id cookie is missing or not well formed.");
    errors.server = [ErrMsgGeneric];
  }
}

function handleCallbackErrors(gatewayError: GatewayError) {
  const errors: { [key: string]: string[] } = {};
  console.log("callback gateway error: ", gatewayError);

  switch (gatewayError.code) {
    case 400:
      errors.badrequest = [gatewayError.message];
      return errors;
    case 401: // there are an enormous amount of these possibilities, this error accounts for them
      errors.callback = [gatewayError.message];
      return errors;
    case 405:
      errors.badrequest = [gatewayError.message];
      return errors;
    case 409:
      errors.callback = [gatewayError.message];
      return errors;
    case 422:
      errors.callback = [gatewayError.message];
      return errors;
    default:
      errors.server = [
        gatewayError.message ||
          "An authentication callback error occurred. Please try refreshing the page and logging in again.",
        "If the problem persists, please contact me.",
      ];
      return errors;
  }
}
