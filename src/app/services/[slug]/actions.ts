"use server";

import {
  ErrNewConfirmPwMismatch,
  ErrPasswordInvalid,
  ErrPasswordInvalidContains,
  ErrPasswordUsedPreviously,
  ResetData,
  ResetPwActionCmd,
  ServiceClient,
  ServiceClientActionCmd,
  validatePasswords,
} from "@/components/forms";
import { validateServiceClient } from "..";
import { cookies } from "next/headers";
import { GatewayError, isGatewayError } from "@/app/api";

export async function handleClientEdit(
  previousState: ServiceClientActionCmd,
  formData: FormData
) {
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
    throw new Error(
      "Session cookie is missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  // light-weight validation of csrf token
  // true validation happpens in the gateway
  const csrf = previousState.csrf;
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    throw new Error(
      "Service client details form CSRF token is missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  // if this is tampered with, the gateway will simply error because
  // the slug will not be found, or invalid, etc.
  const slug = previousState.slug;
  if (!slug || slug.trim().length < 16 || slug.trim().length > 64) {
    throw new Error(
      "Service client slug is missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  // get form data
  let updated: ServiceClient = {
    csrf: csrf,

    name: formData.get("name") as string,
    owner: formData.get("owner") as string,
    enabled: formData.get("enabled") === "on" ? true : false,
    account_expired: formData.get("account_expired") === "on" ? true : false,
    account_locked: formData.get("account_locked") === "on" ? true : false,
  };

  // validate form data
  const errors = validateServiceClient(updated);
  if (errors && Object.keys(errors).length > 0) {
    return {
      csrf: csrf,
      slug: slug,
      scope: updated,
      errors: errors,
    } as ServiceClientActionCmd;
  }

  // call gateway to update service client record
  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/clients/${slug}`,
      {
        method: "PUT",
        headers: {
          Authorization: `${hasSession?.value}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updated),
      }
    );

    if (apiResponse.ok) {
      const success = await apiResponse.json();

      return {
        csrf: csrf,
        slug: slug,
        serviceClient: success,
        errors: {},
      } as ServiceClientActionCmd;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleServiceClientErrors(fail);
        return {
          csrf: csrf,
          slug: slug,
          serviceClient: updated,
          errors: errors,
        } as ServiceClientActionCmd;
      } else {
        throw new Error(
          "Service client details form could not be updated.  Please try again."
        );
      }
    }
  } catch (error) {
    throw new Error(
      "Service client details form could not be updated.  Please try again."
    );
  }
}

export async function handleReset(
  previousState: ResetPwActionCmd,
  formData: FormData
) {
  // lightweight validation of csrf token
  const csrf = previousState.csrf;
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    throw new Error(
      "CSRF token missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  // lightweight validation of resourceId
  const resourceId = previousState.resourceId;
  if (
    !resourceId ||
    resourceId.trim().length < 16 ||
    resourceId.trim().length > 64
  ) {
    throw new Error(
      "Resource ID missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  const reset: ResetData = {
    csrf: csrf,
    resourceId: resourceId,

    current_password: formData.get("current_password") as string,
    new_password: formData.get("new_password") as string,
    confirm_password: formData.get("confirm_password") as string,
  };

  // pw field validation
  const errors = validatePasswords(reset);
  if (errors && Object.keys(errors).length > 0) {
    return {
      csrf: csrf,
      resourceId: resourceId,
      reset: reset,
      errors: errors,
    } as ResetPwActionCmd;
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
    throw new Error(
      "Session cookie is missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/clients/reset`,
      {
        method: "POST",
        headers: {
          Authorization: `${hasSession?.value}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reset),
      }
    );

    if (apiResponse.ok) {
      const success = await apiResponse.json();

      return {
        csrf: csrf,
        resourceId: resourceId,
        reset: {}, // cannot return password values, obviously
        errors: {},
      } as ResetPwActionCmd;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleServiceClientErrors(fail);
        console.log("Gateway error: ", errors);
        return {
          csrf: csrf,
          resourceId: resourceId,
          reset: reset,
          errors: errors,
        } as ResetPwActionCmd;
      } else {
        throw new Error(
          "Password reset form could not be submitted.  Please refresh and try again."
        );
      }
    }
  } catch (error) {
    throw new Error(
      "Attempt to call password reset gateway endpoint failed.  Please refresh and try again."
    );
  }
}

function handleServiceClientErrors(gatewayError: GatewayError) {
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
        case gatewayError.message.includes("name"):
          errors.name = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("owner"):
          errors.owner = [gatewayError.message];
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
          errors.server = [gatewayError.message];
          return errors;
      }
    default:
      errors.server = ["Unhandled error calling gateway service."];
      return errors;
  }
}
