"use server";

import { GatewayError, isGatewayError } from "@/app/api";
import { checkForSessionCookie } from "@/components/checkCookies";
import {
  isAllowedService,
  Permission,
  PermissionActionCmd,
  validatePermission,
} from "..";
import { redirect } from "next/navigation";

export async function handlePermissionAdd(
  previousState: PermissionActionCmd,
  formData: FormData
) {
  // get session token
  const sessionCookie = await checkForSessionCookie();

  // light-weight validation of csrf token
  // true validation happpens in the gateway
  const csrf = previousState.csrf;
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    throw new Error(
      "CSRF token is missing or not well formed.  This value is required and cannot be tampered with."
    );
  }
  // slug unnecessary, will be dropped even if submitted (which would indicate tampering from this page)
  let add: Permission = {
    csrf: csrf,

    // TODO: update service name to be dropdown
    service: formData.get("service") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    active: formData.get("active") === "on" ? true : false,
  };

  // validate form data
  const errors = validatePermission(add);
  if (errors && Object.keys(errors).length > 0) {
    return {
      csrf: csrf,
      permission: add,
      errors: errors,
    } as PermissionActionCmd;
  }

  // check if service is allowed
  if (!add.service || !isAllowedService(add.service)) {
    const errors: { [key: string]: string[] } = {};
    errors.service = ["Service name is not allowed."];
    return {
      csrf: csrf,
      permission: add,
      errors: errors,
    } as PermissionActionCmd;
  }

  // send form data to the gateway
  try {
    const response = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/permissions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${sessionCookie.value}`,
        },
        body: JSON.stringify(add),
      }
    );

    if (response.ok) {
      add = await response.json();
      console.log("Permission added successfully:", add);
    } else {
      const errorResponse = await response.json();
      if (isGatewayError(errorResponse)) {
        const gatewayError: GatewayError = errorResponse;
        const errors = handlePermissionErrors(gatewayError);
        return {
          csrf: csrf,
          permission: add,
          errors: errors,
        } as PermissionActionCmd;
      } else {
        throw new Error("Unhandled error calling the gateway service.");
      }
    }
  } catch (error) {
    console.error("Error adding permission:", error);
    throw new Error("Failed to add permission record.");
  }

  redirect("/permissions");
}

function handlePermissionErrors(gatewayError: GatewayError) {
  const errors: { [key: string]: string[] } = {};

  switch (gatewayError.code) {
    case 400:
      errors.server = [gatewayError.message];
      return errors;
    case 401:
      errors.server = [gatewayError.message];
      return errors;
    case 403:
      errors.server = [gatewayError.message];
      return errors;
    case 404:
      errors.server = [gatewayError.message];
      return errors;
    case 405:
      errors.server = [gatewayError.message];
      return errors;
    case 422:
      switch (true) {
        case gatewayError.message.includes("service"):
          errors.service = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("name"):
          errors.name = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("description"):
          errors.description = [gatewayError.message];
          return errors;
        default:
          break;
      }
    default:
      errors.server = ["Unhandled error calling the gateway service."];
      return errors;
  }
}
