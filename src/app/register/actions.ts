"use server";

import { cookies } from "next/headers";
import {
  ErrMsgGeneric,
  RegistrationData,
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
  let registration: RegistrationData = {
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
      csrf: previousState.csrf,
      complete: false,
      registration: registration,
      errors: errors,
    } as RegistrationActionCmd;
  }

  // check csrf token: super light-weight, just check for absurd tampering
  if (
    !previousState.csrf ||
    previousState.csrf.trim().length < 16 ||
    previousState.csrf.trim().length > 64
  ) {
    console.log("csrf token missing or not well formed.");
    throw new Error(ErrMsgGeneric);
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
    console.log(
      `Session cookie is missing or not well formed for a registration attempt, proposed username: ${registration.username}.`
    );
    throw new Error(ErrMsgGeneric);
  }

  // if any of the fields are missing, the gateway will return a 400
  const registrationCmd: RegistrationCmd = {
    csrf: previousState.csrf,
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
    const day =
      registration.birthDay < 10
        ? `0${registration.birthDay}`
        : registration.birthDay;
    registrationCmd.birthdate = `${registration.birthYear}-${month}-${day}`;
  }

  // call gateway registration endpoint
  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationCmd),
      }
    );

    if (apiResponse.ok) {
      const success = await apiResponse.json();
      console.log("Registration successful: ", success);
      return {
        complete: true,
        registration: success,
        errors: errors,
      } as RegistrationActionCmd;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleRegistrationErrors(fail);
        console.log("Gateway error: ", errors);
        return {
          complete: false,
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
