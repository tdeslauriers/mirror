"use server";

import { cookies } from "next/headers";
import { Profile, ProfileActionCmd, validateUpdateProfile } from ".";
import { ErrMsgGeneric, GatewayError, isGatewayError } from "../api";
import {
  ErrNewConfirmPwMismatch,
  ErrPasswordInvalid,
  ErrPasswordInvalidContains,
  ErrPasswordUsedPreviously,
  ResetData,
  ResetPwActionCmd,
  validatePasswords,
} from "@/components/forms";
import { getAuthCookies } from "@/components/checkCookies";

export async function handleUserEdit(
  previousState: ProfileActionCmd,
  formData: FormData
) {
  // get form data
  const csrf = previousState.csrf;

  // any fields that are not allowed to be changed by user will not be submitted
  // likewise, gateway/identity will dump any fields that are not allowed to be changed
  const updated: Profile = {
    csrf: csrf ?? "",

    firstname: formData.get("firstname") as string,
    lastname: formData.get("lastname") as string,
    birth_month: parseInt(formData.get("birthMonth") as string),
    birth_day: parseInt(formData.get("birthDay") as string),
    birth_year: parseInt(formData.get("birthYear") as string),
  };

  // get auth cookies
  const cookies = await getAuthCookies("/profile");
  if (!cookies.ok) {
    console.log(`Failed to get auth cookies: ${cookies.error.message}`);
    return {
      csrf: csrf,
      profile: updated,
      errors: {
        server: [cookies.error.message || ErrMsgGeneric],
      },
    } as ProfileActionCmd;
  }

  // light-weight validation of csrf token
  // true validation happpens in the gateway
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    console.log(
      `User ${cookies.data.identity?.username} submitted CSRF token which is missing or not well formed.`
    );
    const errors: { [key: string]: string[] } = {};
    errors.csrf = [
      "CSRF token missing or not well formed. This value is required and cannot be tampered with.",
    ];
    return {
      csrf: csrf,
      profile: updated,
      errors: errors,
    } as ProfileActionCmd;
  }

  // field validation
  const errors = validateUpdateProfile(updated);
  if (errors && Object.keys(errors).length > 0) {
    console.log(
      `Profile update validation failed for user ${
        cookies.data.identity?.username
      }: ${JSON.stringify(errors)}`
    );
    return { csrf: csrf, profile: updated, errors: errors } as ProfileActionCmd;
  }

  // call gateway profile endpoint
  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/profile`,
      {
        method: "PUT",
        headers: {
          Content_Type: "application/json",
          Authorization: `${cookies.data.session}`,
        },
        body: JSON.stringify(updated),
      }
    );

    if (apiResponse.ok) {
      const success = await apiResponse.json();
      console.log(
        `Profile updated successfully for user ${cookies.data.identity?.username}`
      );
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
      } else {
        console.error(
          `Profile update failed for user ${cookies.data.identity?.username} due to unhandled gateway error: ${apiResponse.status} ${apiResponse.statusText}`
        );
        return {
          csrf: csrf,
          profile: updated,
          errors: {
            server: [
              "Profile update failed due to an unhandled gateway error.",
            ],
          },
        } as ProfileActionCmd;
      }
    }
  } catch (error) {
    console.error(
      `Profile update failed for user ${cookies.data.identity?.username}: ${
        error ? error : "reason unknown"
      }`
    );
    return {
      csrf: csrf,
      profile: updated,
      errors: {
        server: ["Profile update failed due to an unhandled gateway error."],
      },
    } as ProfileActionCmd;
  }
}

export async function handleReset(
  previousState: ResetPwActionCmd,
  formData: FormData
) {
  // get form data
  const csrf = previousState.csrf;

  const resetCmd: ResetData = {
    csrf: csrf ?? "",
    // resource_id not used: identity will come from user's access token in gateway

    current_password: formData.get("current_password") as string,
    new_password: formData.get("new_password") as string,
    confirm_password: formData.get("confirm_password") as string,
  };

  // get auth cookies
  const cookies = await getAuthCookies("/profile");
  if (!cookies.ok) {
    console.log(`Failed to get auth cookies: ${cookies.error.message}`);
    return {
      csrf: csrf,
      reset: resetCmd,
      errors: {
        server: [cookies.error.message || ErrMsgGeneric],
      },
    } as ResetPwActionCmd;
  }

  // light-weight validation of csrf token
  // true validation happpens in the gateway
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    console.log(
      `User ${cookies.data.identity?.username} submitted CSRF token which is missing or not well formed.`
    );
    const errors: { [key: string]: string[] } = {};
    errors.csrf = [
      "CSRF token missing or not well formed. This value is required and cannot be tampered with.",
    ];
    return {
      csrf: csrf,
      reset: resetCmd,
      errors: errors,
    } as ResetPwActionCmd;
  }

  // field validation
  const errors = validatePasswords(resetCmd);
  if (errors && Object.keys(errors).length > 0) {
    console.log(
      `Password reset validation failed for user ${
        cookies.data.identity?.username
      }: ${JSON.stringify(errors)}`
    );
    return { csrf: csrf, reset: resetCmd, errors: errors } as ResetPwActionCmd;
  }

  // call gateway reset endpoint
  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/reset`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${cookies.data.session}`,
        },
        body: JSON.stringify(resetCmd),
      }
    );

    if (apiResponse.ok) {
      console.log(
        `Password reset successfully for user ${cookies.data.identity?.username}`
      );
      return {
        csrf: csrf,
        reset: {}, // cannot return password values, obviously
        errors: {},
      } as ResetPwActionCmd;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleProfileErrors(fail);
        console.log(
          `Password reset failed for user ${
            cookies.data.identity?.username
          }: ${JSON.stringify(errors)}`
        );
        return {
          csrf: csrf,
          reset: resetCmd,
          errors: errors,
        } as ResetPwActionCmd;
      } else {
        console.error(
          `Password reset failed for user ${cookies.data.identity?.username} due to unhandled gateway error: ${apiResponse.status} ${apiResponse.statusText}`
        );
        return {
          csrf: csrf,
          reset: resetCmd,
          errors: {
            server: [
              "Password reset failed due to an unhandled gateway error.",
            ],
          },
        } as ResetPwActionCmd;
      }
    }
  } catch (error) {
    console.error(
      `Password reset failed for user ${cookies.data.identity?.username}: ${error}`
    );
    return {
      csrf: csrf,
      reset: resetCmd,
      errors: {
        server: ["Password reset failed due to an unhandled gateway error."],
      },
    } as ResetPwActionCmd;
  }
}

function handleProfileErrors(gatewayError: GatewayError) {
  const errors: { [key: string]: string[] } = {};

  switch (gatewayError.code) {
    case 400:
      errors.server = [gatewayError.message];
      return errors;
    case 401:
      errors.server = [gatewayError.message];
    case 403:
      errors.server = [gatewayError.message];
    case 404:
      errors.server = [gatewayError.message];
    case 405:
      errors.server = [gatewayError.message];
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
          errors.confirm_password = [gatewayError.message];
          return errors;
        case gatewayError.message.includes(ErrNewConfirmPwMismatch):
          errors.confirm_password = [gatewayError.message];
          return errors;
        case gatewayError.message.includes(ErrPasswordInvalid):
          errors.confirm_password = [gatewayError.message];
          return errors;
        case gatewayError.message.includes(ErrPasswordInvalidContains):
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
