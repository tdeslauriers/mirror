"use server";

import { cookies } from "next/headers";
import {
  Profile,
  ProfileActionCmd,
  ResetData,
  ResetPwActionCmd,
  validatePasswords,
  validateUpdateProfile,
} from ".";
import { ErrMsgGeneric, GatewayError, isGatewayError } from "../api";

export async function handleUserEdit(
  previousState: ProfileActionCmd,
  formData: FormData
) {
  // light-weight validation of csrf token
  // true validation happpens in the gateway
  const csrf = previousState.csrf;
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    throw new Error(
      "CSRF token missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  // any fields that are not allowed to be changed by user will not be submitted
  // likewise, gateway/identity will dump any fields that are not allowed to be changed
  let updated: Profile = {
    csrf: csrf,

    firstname: formData.get("firstname") as string,
    lastname: formData.get("lastname") as string,
    birth_month: parseInt(formData.get("birthMonth") as string),
    birth_day: parseInt(formData.get("birthDay") as string),
    birth_year: parseInt(formData.get("birthYear") as string),
  };

  // field validation
  const errors = validateUpdateProfile(updated);
  if (errors && Object.keys(errors).length > 0) {
    return { csrf: csrf, profile: updated, errors: errors } as ProfileActionCmd;
  }

  // get session token
  const cookieStore = await cookies();
  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;

  // call gateway profile endpoint
  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/profile`,
      {
        method: "PUT",
        headers: {
          Content_Type: "application/json",
          Authorization: `${hasSession?.value}`,
        },
        body: JSON.stringify(updated),
      }
    );

    if (apiResponse.ok) {
      const success = await apiResponse.json();
      return {
        csrf: csrf,
        profile: success,
        errors: errors,
      } as ProfileActionCmd;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleProfileErrors(fail);
        return {
          csrf: csrf,
          profile: updated,
          errors: errors,
        } as ProfileActionCmd;
      }
    }
  } catch (error) {
    throw new Error(ErrMsgGeneric);
  }

  return { csrf: csrf, profile: updated, errors: errors } as ProfileActionCmd;
}

export async function handleReset(
  previousState: ResetPwActionCmd,
  formData: FormData
) {
  // light-weight validation of csrf token
  // true validation happpens in the gateway
  const csrf = previousState.csrf;
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    throw new Error(
      "CSRF token missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  const resetCmd: ResetData = {
    csrf: csrf,

    current_password: formData.get("current_password") as string,
    new_password: formData.get("new_password") as string,
    confirm_password: formData.get("confirm_password") as string,
  };

  // field validation
  const errors = validatePasswords(resetCmd);
  if (errors && Object.keys(errors).length > 0) {
    return { csrf: csrf, reset: resetCmd, errors: errors } as ResetPwActionCmd;
  }

  // get session token
  const cookieStore = await cookies();
  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;

  // call gateway reset endpoint
  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/reset`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${hasSession?.value}`,
        },
        body: JSON.stringify(resetCmd),
      }
    );

    if (apiResponse.ok) {
      console.log("Password reset successful.");
      return {
        csrf: csrf,
        reset: {}, // cannot return password values, obviously
        errors: {},
      } as ResetPwActionCmd;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleProfileErrors(fail);
        console.log("Gateway error: ", errors);
        return {
          csrf: csrf,
          reset: resetCmd,
          errors: errors,
        } as ResetPwActionCmd;
      } else {
        console.log(
          "Unhandled error calling the gateway reset service: ",
          fail
        );
        throw new Error(ErrMsgGeneric);
      }
    }
  } catch (error: any) {
    console.log("Attempt to call gateway service failed.", error);
    throw new Error(error.message || ErrMsgGeneric);
  }
}

const ErrPasswordUsedPreviously = "password has been used previously";
const ErrNewConfirmPwMismatch =
  "new password and confirmation password do not match";

function handleProfileErrors(gatewayError: GatewayError) {
  const errors: { [key: string]: string[] } = {};

  switch (gatewayError.code) {
    case 400:
      errors.badrequest = [gatewayError.message];
      return errors;
    case 401:
    case 403:
    case 404:
      errors.server = [gatewayError.message];
    case 405:
      errors.badrequest = [gatewayError.message];
      return errors;
    case 422:
      // temporary fix for now: determine which error received
      switch (true) {
        case gatewayError.message.includes("firstname"):
          errors.firstname = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("lastname"):
          errors.lastname = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("birthdate"):
          errors.birthdate = [gatewayError.message];
          return errors;
        case gatewayError.message.includes(ErrPasswordUsedPreviously):
          errors.new_password = [gatewayError.message];
          return errors;
        case gatewayError.message.includes(ErrNewConfirmPwMismatch):
          errors.confirm_password = [gatewayError.message];
          return errors;
        default:
          break;
      }
    default:
      errors.server = [gatewayError.message || ErrMsgGeneric];
      return errors;
  }
}
