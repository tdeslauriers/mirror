"use server";

import { getAuthCookies, getSessionCookie } from "@/components/checkCookies";
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
  // get form data
  const csrf = previousState.csrf;
  const slug = previousState.slug;
  const service = previousState.service;

  // build updated permission object
  let updated: Permission = {
    csrf: csrf ?? "",

    // service is dropped upstream
    // need to create a new permission in the applicable service, they cannot be moved from one to the other.
    service_name: service as string, // needs to be added here because field disabled in form ==> null
    permission: formData.get("permission") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    active: formData.get("active") === "on" ? true : false,
  };

  // get auth cookies
  const cookies = await getAuthCookies(`/permissions/${service}/${slug}`);
  if (!cookies.ok) {
    console.log(
      `Could not verify session cookies for user attempting to update permission ${slug} in service ${service}: ${
        cookies.error ? cookies.error.message : "unknown error"
      }`
    );
    return {
      csrf: csrf,
      slug: slug,
      service: service,
      permission: updated,
      errors: {
        server: [
          `Failed to verify authentication cookies. Please login again and try to update the permission.`,
        ],
      },
    } as PermissionActionCmd;
  }

  // light-weight validation of csrf token
  // true validation happpens in the gateway
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    console.log(
      `User ${cookies.data.identity?.username} submitted CSRF token which is missing or not well formed.`
    );
    return {
      csrf: csrf,
      slug: slug,
      service: service,
      permission: updated,
      errors: {
        csrf: [
          "CSRF token is missing or not well formed.  This value is required and cannot be tampered with.",
        ],
      },
    } as PermissionActionCmd;
  }

  // if this is tampered with, the gateway will simply error because
  // the slug will not be found, or invalid, etc.
  if (!slug || slug.trim().length < 16 || slug.trim().length > 64) {
    console.log(
      `User ${cookies.data.identity?.username} submitted permission slug which is missing or not well formed.`
    );
    return {
      csrf: csrf,
      slug: slug,
      service: service,
      permission: updated,
      errors: {
        server: [
          "Permission slug is missing or not well formed.  This value is required and cannot be tampered with.",
        ],
      },
    } as PermissionActionCmd;
  }

  // validate service name --> change would indicate tampering
  if (!service || !isAllowedService(service)) {
    console.log(
      `User ${cookies.data.identity?.username} submitted permission service name which is not allowed: ${service}`
    );
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
    console.log(
      `User ${
        cookies.data.identity?.username
      } submitted permission data which failed validation: ${JSON.stringify(
        errors
      )}`
    );
    return {
      csrf: csrf,
      slug: slug,
      service: service,
      permission: updated,
      errors: errors,
    } as PermissionActionCmd;
  }

  //   submit update to the gateway
  try {
    // call gateway to update permission record
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/permissions/${service}/${slug}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${cookies.data.session}`,
        },
        body: JSON.stringify(updated),
      }
    );

    if (apiResponse.ok) {
      const success = await apiResponse.json();
      console.log(
        `permission record ${slug} in service ${service} updated successfully by user ${cookies.data.identity?.username}.`
      );
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
        console.log(
          `permission record ${slug} in service ${service} update failed for user ${
            cookies.data.identity?.username
          }: ${JSON.stringify(errors)}`
        );
        return {
          csrf: csrf,
          slug: slug,
          service: service,
          permission: updated,
          errors: errors,
        } as PermissionActionCmd;
      } else {
        console.error(
          `permission record ${slug} in service ${service} update failed for user ${cookies.data.identity?.username} due to unhandled gateway error: ${fail.message}`
        );
        return {
          csrf: csrf,
          slug,
          service,
          permission: updated,
          errors: {
            server: [
              fail.message
                ? fail.message
                : "Permission update failed due to an unhandled gateway error.",
            ],
          },
        } as PermissionActionCmd;
      }
    }
  } catch (error) {
    console.error(
      `permission record ${slug} in service ${service} update failed for user ${cookies.data.identity?.username}: ${error}`
    );
    return {
      csrf: csrf,
      slug: slug,
      service: service,
      permission: updated,
      errors: {
        server: ["Permission update failed due to an unexpected error."],
      },
    } as PermissionActionCmd;
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
