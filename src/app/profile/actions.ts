"use server";

import { Profile, validateUpdateProfile } from ".";
import { ProfileActionCmd as ProfileActionCmd } from "."; // Assuming ProfileAction is defined in types.ts
import { ErrMsgGeneric, GatewayError, isGatewayError } from "../api";

export async function handleUserEdit(
  previousState: ProfileActionCmd,
  formData: FormData
) {
  console.log("formData: ", formData.get("birthYear") as string);
  // any fields that are not allowed to be changed by user will not be submitted
  // likewise, gateway/identity will dump any fields that are not allowed to be changed
  let updated: Profile = {
    csrf: formData.get("csrfToken") as string,
    firstname: formData.get("firstname") as string,
    lastname: formData.get("lastname") as string,
    birth_month: parseInt(formData.get("birthMonth") as string),
    birth_day: parseInt(formData.get("birthDay") as string),
    birth_year: parseInt(formData.get("birthYear") as string),
  };

  // field validation
  const errors = validateUpdateProfile(updated);
  if (errors && Object.keys(errors).length > 0) {
    return { profile: updated, errors: errors } as ProfileActionCmd;
  }

  // call gateway profile endpoint
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  try {
    const apiResponse = await fetch("https://localhost:8443/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updated),
    });

    if (apiResponse.ok) {
      const success = await apiResponse.json();
      return { profile: success, errors: errors } as ProfileActionCmd;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleProfileErrors(fail);
        return { profile: updated, errors: errors } as ProfileActionCmd;
      }
    }
  } catch (error) {
    throw new Error(ErrMsgGeneric);
  }

  return { profile: updated, errors: errors } as ProfileActionCmd;
}

function handleProfileErrors(gatewayError: GatewayError) {
  const errors: { [key: string]: string[] } = {};

  switch (gatewayError.code) {
    case 400:
      errors.badrequest = [gatewayError.message];
      return errors;
    case 401:
    case 403:
    case 404:
      throw new Error(gatewayError.message);
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
        default:
          break;
      }
    default:
      errors.server = [gatewayError.message || ErrMsgGeneric];
      return errors;
  }
}
