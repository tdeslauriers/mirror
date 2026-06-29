"use server";

import { ResetData, ResetPwActionCmd } from "@/components/forms";
import { ErrMsgGeneric, isGatewayError } from "../api";

import { getAuthCookies } from "@/components/checkCookies";
import { validatePasswords } from "../register";
import { handleProfileErrors, validateResetPasswords } from ".";

export async function handleReset(
  previousState: ResetPwActionCmd,
  formData: FormData,
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
      `User ${cookies.data.identity?.username} submitted CSRF token which is missing or not well formed.`,
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
  const errors = validateResetPasswords(resetCmd);
  if (errors && Object.keys(errors).length > 0) {
    console.log(
      `Password reset validation failed for user ${
        cookies.data.identity?.username
      }: ${JSON.stringify(errors)}`,
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
      },
    );

    if (apiResponse.ok) {
      console.log(
        `Password reset successfully for user ${cookies.data.identity?.username}`,
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
          }: ${JSON.stringify(errors)}`,
        );
        return {
          csrf: csrf,
          reset: resetCmd,
          errors: errors,
        } as ResetPwActionCmd;
      } else {
        console.error(
          `Password reset failed for user ${cookies.data.identity?.username} due to unhandled gateway error: ${apiResponse.status} ${apiResponse.statusText}`,
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
      `Password reset failed for user ${cookies.data.identity?.username}: ${error}`,
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
