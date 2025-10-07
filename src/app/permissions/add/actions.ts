"use server";

import { GatewayError, isGatewayError } from "@/app/api";
import { getAuthCookies, getSessionCookie } from "@/components/checkCookies";
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
  // get form data
  const csrf = previousState.csrf;

  // slug unnecessary, will be dropped even if submitted (which would indicate tampering from this page)
  let add: Permission = {
    csrf: csrf ?? "",

    // TODO: update service name to be dropdown
    service_name: formData.get("service_name") as string, // needs to be added here because field disabled in form ==> null
    permission: formData.get("permission") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    active: formData.get("active") === "on" ? true : false,
  };

  // get auth cookie data
  const cookies = await getAuthCookies(`/permissions/add`);
  if (!cookies.ok) {
    console.log(
      `Could not verify session cookies for user attempting to add permission in service ${
        add.service_name
      }: ${cookies.error ? cookies.error.message : "unknown error"}`
    );
    return {
      csrf: csrf,
      permission: add,
      errors: {
        server: [
          `Failed to verify authentication cookies. Please login again and try to add the permission.`,
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
    const errors: { [key: string]: string[] } = {};
    errors.csrf = [
      "CSRF token missing or not well formed. This value is required and cannot be tampered with.",
    ];
    return {
      csrf: csrf,
      permission: add,
      errors: errors,
    } as PermissionActionCmd;
  }

  // check if service is allowed
  if (!add.service_name || !isAllowedService(add.service_name)) {
    const errors: { [key: string]: string[] } = {};
    errors.service = ["Service name is not allowed."];

    console.log(
      `User ${cookies.data.identity?.username} submitted service name which is not allowed: ${add.service_name}`
    );
    return {
      csrf: csrf,
      permission: add,
      errors: errors,
    } as PermissionActionCmd;
  }

  // validate form data
  const errors = validatePermission(add);
  if (errors && Object.keys(errors).length > 0) {
    console.log(
      `Permission data added by user ${
        cookies.data.identity?.username
      } failed validation: ${JSON.stringify(errors)}`
    );
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
          Authorization: `${cookies.data.session}`,
        },
        body: JSON.stringify(add),
      }
    );

    if (response.ok) {
      const added = await response.json();
      console.log(
        `permission record ${added.name} in service ${added.service_name} added successfully by user ${cookies.data.identity?.username}.`
      );
    } else {
      const errorResponse = await response.json();
      if (isGatewayError(errorResponse)) {
        const gatewayError: GatewayError = errorResponse;
        const errors = handlePermissionErrors(gatewayError);
        console.log(
          `user ${
            cookies.data.identity?.username
          } failed to add permission record: ${JSON.stringify(errors)}`
        );
        return {
          csrf: csrf,
          permission: add,
          errors: errors,
        } as PermissionActionCmd;
      } else {
        console.error(
          `permission record add failed for user ${cookies.data.identity?.username} due to unhandled gateway error: ${errorResponse.message}`
        );
        return {
          csrf: csrf,
          permission: add,
          errors: {
            server: [
              errorResponse.message
                ? errorResponse.message
                : "Permission record add failed due to an unhandled gateway error.",
            ],
          },
        } as PermissionActionCmd;
      }
    }
  } catch (error) {
    console.error(
      `user ${cookies.data.identity?.username} failed to add permission record: ${error}`
    );
    return {
      csrf: csrf,
      permission: add,
      errors: {
        server: [
          "Permission record add failed due to an unhandled gateway error.",
        ],
      },
    } as PermissionActionCmd;
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
        case gatewayError.message.includes("service name"):
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
