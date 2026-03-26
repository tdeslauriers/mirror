"use server";

import {
  handleProfileErrors,
  Profile,
  ProfileActionCmd,
  validateUpdateProfile,
} from ".";
import { ErrMsgGeneric, isGatewayError } from "../api";
import { getAuthCookies } from "@/components/checkCookies";

export async function handleUserEdit(
  previousState: ProfileActionCmd,
  formData: FormData,
) {
  // get form data
  const csrf = previousState.csrf;
  const username = previousState.username;

  // any fields that are not allowed to be changed by user will not be submitted
  // likewise, gateway/identity will dump any fields that are not allowed to be changed
  const updated: Profile = {
    csrf: csrf ?? "",
    username: username ?? "",

    firstname: formData.get("firstname") as string,
    lastname: formData.get("lastname") as string,
    nickname: formData.get("nickname") as string,
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
      username: username,
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
      `User ${cookies.data.identity?.username} submitted CSRF token which is missing or not well formed.`,
    );
    const errors: { [key: string]: string[] } = {};
    errors.csrf = [
      "CSRF token missing or not well formed. This value is required and cannot be tampered with.",
    ];
    return {
      csrf: csrf,
      username: username,
      profile: updated,
      errors: errors,
    } as ProfileActionCmd;
  }

  // light-weight validation of username
  // true validation happpens in the gateway
  if (!username || username.trim().length < 5 || username.trim().length > 255) {
    console.log(
      `User ${cookies.data.identity?.username} submitted username which is missing or not well formed.`,
    );
    const errors: { [key: string]: string[] } = {};
    errors.username = [
      "Username missing or not well formed. This value is required and cannot be tampered with.",
    ];
    return {
      csrf: csrf,
      username: username,
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
      }: ${JSON.stringify(errors)}`,
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
      },
    );

    if (apiResponse.ok) {
      const success = await apiResponse.json();
      console.log(
        `Profile updated successfully for user ${cookies.data.identity?.username}`,
      );
      return {
        csrf: csrf,
        username: username,
        profile: success,
        errors: errors,
      } as ProfileActionCmd;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleProfileErrors(fail);
        return {
          csrf: csrf,
          username: username,
          profile: updated,
          errors: errors,
        } as ProfileActionCmd;
      } else {
        console.error(
          `Profile update failed for user ${cookies.data.identity?.username} due to unhandled gateway error: ${apiResponse.status} ${apiResponse.statusText}`,
        );
        return {
          csrf: csrf,
          username: username,
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
      }`,
    );
    return {
      csrf: csrf,
      username: username,
      profile: updated,
      errors: {
        server: ["Profile update failed due to an unhandled gateway error."],
      },
    } as ProfileActionCmd;
  }
}
