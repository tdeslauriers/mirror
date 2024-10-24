"use server";

import { cookies } from "next/headers";
import {
  ErrMsgGeneric,
  Registration,
  RegistrationActionCmd,
  RegistrationCmd,
  validateRegistration,
} from ".";
import { GatewayError, isGatewayError } from "../api";

export async function handleRegistration(
  previousState: RegistrationActionCmd,
  formData: FormData
) {
  // any fields that are not allowed to be changed by user will not be submitted
  // likewise, gateway/identity will dump any fields that are not allowed to be changed
  let registration: Registration = {
    csrf: formData.get("csrfToken") as string,
    username: formData.get("username") as string,
    password: formData.get("password") as string,
    confirm_password: formData.get("confirm_password") as string,
    firstname: formData.get("firstname") as string,
    lastname: formData.get("lastname") as string,
    birthMonth: parseInt(formData.get("birthMonth") as string),
    birthDay: parseInt(formData.get("birthDay") as string),
    birthYear: parseInt(formData.get("birthYear") as string),
  };

  // field validation
  const errors = validateRegistration(registration);
  if (errors && Object.keys(errors).length > 0) {
    return {
      registrationComplete: false,
      registration: registration,
      errors: errors,
    } as RegistrationActionCmd;
  }

  // get session token
  const cookieStore = await cookies();
  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;

  if (!hasSession) {
    console.log("Session cookie is missing");
    throw new Error(ErrMsgGeneric);
  }

  // if any of the fields are missing, the gateway will return a 400
  const registrationCmd: RegistrationCmd = {
    csrf: registration.csrf,
    session: hasSession.value,
    username: registration.username,
    password: registration.password,
    confirm_password: registration.confirm_password,
    firstname: registration.firstname,
    lastname: registration.lastname,
  };

  // dob is optional
  if (
    registration.birthMonth &&
    registration.birthDay &&
    registration.birthYear
  ) {
    const month =
      registration.birthMonth < 10
        ? `0${registration.birthMonth}`
        : registration.birthMonth;
    registrationCmd.birthdate = `${registration.birthYear}-${month}-${registration.birthDay}`;
  }

  // call gateway registration endpoint
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  try {
    const apiResponse = await fetch("https://localhost:8443/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registrationCmd),
    });

    if (apiResponse.ok) {
      const success = await apiResponse.json();
      console.log("Registration successful: ", success);
      return {
        registrationComplete: true,
        registration: success,
        errors: errors,
      } as RegistrationActionCmd;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleRegistrationErrors(fail);
        console.log("Gateway error: ", errors);
        console.log("Registration in gateway error: ", registration);
        return {
          registrationComplete: false,
          registration: registration,
          errors: errors,
        } as RegistrationActionCmd;
      } else {
        console.log("Unhandled error calling the gateway service: ", fail);
        throw new Error(ErrMsgGeneric);
      }
    }
  } catch (error) {
    console.log("Attempt to call the gateway service failed: ", error);
    throw new Error(ErrMsgGeneric);
  }
}

function handleRegistrationErrors(gatewayError: GatewayError) {
  const errors: { [key: string]: string[] } = {};

  switch (gatewayError.code) {
    case 400:
      errors.badrequest = [gatewayError.message];
      return errors;
    case 405:
      errors.badrequest = [gatewayError.message];
      return errors;
    case 409:
      errors.username = [gatewayError.message];
      return errors;
    case 422:
      // temporary fix for now: determine which error received
      switch (true) {
        case gatewayError.message.includes("username"):
          errors.username = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("password"):
          errors.password = [gatewayError.message];
          return errors;
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
