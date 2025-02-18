"use server";

import { cookies } from "next/headers";
import { handleServiceClientErrors, validateClientRegister } from "..";
import {
  ClientRegisterActionCmd,
  RegisterClient,
} from "./../../../components/forms/index";
import { isGatewayError } from "@/app/api";

const ErrMsgGeneric =
  "An error occurred: failed to register service client. Please try again.";

export default async function handleClientRegister(
  previousState: ClientRegisterActionCmd,
  formData: FormData
) {
  let cmd: RegisterClient = {
    csrf: previousState.csrf, // field level check in validateClientRegister

    name: formData.get("name") as string,
    owner: formData.get("owner") as string,
    password: formData.get("password") as string,
    confirm_password: formData.get("confirm_password") as string,
  };

  const errors = validateClientRegister(cmd);
  if (Object.keys(errors).length > 0) {
    return {
      csrf: previousState.csrf,
      complete: false,
      registration: cmd,
      errors: errors,
    };
  }

  // get session token
  const cookieStore = await cookies();
  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;

  if (
    !hasSession ||
    hasSession.value.trim().length < 16 ||
    hasSession.value.trim().length > 64
  ) {
    console.log(`Session cookie is missing or not well formed.`);
    throw new Error(ErrMsgGeneric);
  }

  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/clients/register`,
      {
        method: "POST",
        headers: {
          Authorization: `${hasSession?.value}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cmd),
      }
    );

    if (apiResponse.ok) {
      const success = await apiResponse.json();
      return {
        csrf: previousState.csrf,
        complete: true,
        registration: success, // will be created client object with uuid, slug, booleans, etc.
        errors: {},
      };
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleServiceClientErrors(fail);
        return {
          csrf: previousState.csrf,
          complete: false,
          registration: cmd,
          errors: errors,
        };
      } else {
        throw new Error(
          "Service client could not be registered with the gateway."
        );
      }
    }
  } catch (e) {
    throw new Error(ErrMsgGeneric);
  }
}
