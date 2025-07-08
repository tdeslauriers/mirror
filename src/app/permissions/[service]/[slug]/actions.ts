"use server";

import { checkForSessionCookie } from "@/components/checkCookies";
import {
  isAllowedService,
  Permission,
  PermissionActionCmd,
  validatePermission,
} from "../..";
import { isGatewayError } from "@/app/api";

export async function handlePermissionEdit(
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
      "CSRF token is missing or not well formed. This value is required and cannot be tampered with."
    );
  }

  // if this is tampered with, the gateway will simply error because
  // the slug will not be found, or invalid, etc.
  const slug = previousState.slug;
  if (!slug || slug.trim().length < 16 || slug.trim().length > 64) {
    throw new Error(
      "Scope slug is missing or not well formed. This value is required and cannot be tampered with."
    );
  }

  const service = previousState.service;

  // build updated permission object
  let updated: Permission = {
    csrf: csrf,

    // service is dropped upstream
    // need to create a new permission in the applicable service, they cannot be moved from one to the other.
    service: service as string, // needs to be added here because field disabled in form ==> null
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    active: formData.get("active") === "on" ? true : false,
  };

  // validate service name --> change would indicate tampering
  if (!service || !isAllowedService(service)) {
    const errors: { [key: string]: string[] } = {};
    errors.service = ["Service name is not allowed."];
    return {
      csrf: csrf,
      slug: slug,
      service: service,
      permission: updated,
      errors: errors,
    } as PermissionActionCmd;
  }

  // validate form data
  const errors = validatePermission(updated);
  if (errors && Object.keys(errors).length > 0) {
    return {
      csrf: csrf,
      slug: slug,
      service: service,
      permission: updated,
      errors: errors,
    } as PermissionActionCmd;
  }

  // submit update to the gateway
  try {
    // call gateway to update permission record
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/permissions/${service}/${slug}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${sessionCookie.value}`,
        },
        body: JSON.stringify(updated),
      }
    );

    if (apiResponse.ok) {
      const success = await apiResponse.json();
      return {
        csrf: csrf,
        slug: slug,
        service: service,
        permission: success as Permission,
        errors: {},
      } as PermissionActionCmd;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handlePermissionErrors(fail);
        return {
          csrf: csrf,
          slug: slug,
          service: service,
          permission: updated,
          errors: errors,
        } as PermissionActionCmd;
      } else {
        throw new Error(
          "Failed to update permission record due to unhandled gateway error."
        );
      }
    }
  } catch (error) {
    throw new Error(
      "Failed to update permission record due to unhandled error."
    );
  }
}

function handlePermissionErrors(gatewayError: any) {
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
          errors.service_name = [gatewayError.message];
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
      errors.server = ["An unexpected error occurred."];
      return errors;
  }
}
