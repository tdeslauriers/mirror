"use server";

import {
  LoginData,
  LoginActionCmd,
  LoginCmd,
  ErrLoginSumbit,
  validateLogin,
  validateOauth,
} from ".";
import { cookies } from "next/headers";
import { CallbackCmd, GatewayError, isGatewayError } from "../api";
import { redirect } from "next/navigation";

export async function handleLogin(
  previousState: LoginActionCmd,
  formData: FormData
) {
  let login: LoginData = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  };

  // login form field validation
  const errors = validateLogin(login);
  if (errors && Object.keys(errors).length > 0) {
    return {
      csrf: previousState.csrf,
      oauth: previousState.oauth,
      login: login,
      errors: errors,
    } as LoginActionCmd;
  }

  // validate oauth flow data
  if (!previousState.oauth) {
    console.log(
      `Login failed for username ${login.username}: OAuth data is missing from login form.`
    );
    throw new Error(ErrLoginSumbit);
  }

  // logs and throws error if oauth data element is not valid
  validateOauth(previousState.oauth);

  // light-weight validation of csrf token
  if (
    !previousState.csrf ||
    previousState.csrf.trim().length < 16 ||
    previousState.csrf.trim().length > 64
  ) {
    console.log(
      `Login failed for username ${login.username}: csrf token missing or not well formed.`
    );
    throw new Error(ErrLoginSumbit);
  }

  // get session token
  const cookieStore = await cookies();
  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;

  // light-weight validation of session cookie
  if (
    !hasSession ||
    !hasSession.value ||
    hasSession.value.length < 16 ||
    hasSession.value.length > 64
  ) {
    console.log(
      `Login failed for username ${login.username}: session cookie is missing, or not well formed.`
    );
    throw new Error(ErrLoginSumbit);
  }

  const loginCmd: LoginCmd = {
    username: login.username?.trim(),
    password: login.password?.trim(),

    client_id: previousState.oauth.client_id?.trim(),
    response_type: previousState.oauth.response_type?.trim(),
    state: previousState.oauth.state?.trim(),
    nonce: previousState.oauth.nonce?.trim(),
    redirect: previousState.oauth.redirect_url?.trim(),

    session: hasSession.value?.trim(),
    csrf: previousState.csrf?.trim(),
  };

  // variable to hold callback if login call successful
  let callback: string | null = null;

  // call gateway registration endpoint
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}:${process.env.GATEWAY_SERVICE_PORT}/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginCmd),
      }
    );

    if (apiResponse.ok) {
      const success: CallbackCmd = await apiResponse.json();

      // session will not be in payload, but check/remove anyway
      if (success.session) {
        delete success.session;
      }

      // build callback url
      callback = `/callback?client_id=${success.client_id}&response_type=${
        success.response_type
      }&auth_code=${success.auth_code}&state=${success.state}&nonce=${
        success.nonce
      }&redirect_url=${encodeURIComponent(success.redirect ?? "")}`;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        // handler will throw errors or return field errors as applicable
        const errors = handleLoginErrors(fail);
        return {
          csrf: previousState.csrf,
          oauth: previousState.oauth,
          login: login,
          errors: errors,
        } as LoginActionCmd;
      } else {
        console.log(
          `Gateway returned unhandled error for username ${login.username}: ${fail})`
        );
        throw new Error(ErrLoginSumbit);
      }
    }
  } catch (error) {
    console.log(
      `Login call to gateway failed for username ${login.username}: ${error})`
    );
    throw new Error(ErrLoginSumbit);
  }

  if (callback) {
    redirect(callback);
  } else {
    console.log(
      `Login failed for username ${login.username}: callback url not set.`
    );
    throw new Error(ErrLoginSumbit);
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
      console.log(gatewayError.message);
      throw new Error(ErrLoginSumbit);
  }
}
