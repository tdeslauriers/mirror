"use server";

import { ServiceClient, ServiceClientActionCmd } from "@/components/forms";
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
        default:
          errors.server = [gatewayError.message];
          return errors;
      }
    default:
      errors.server = ["Unhandled error calling gateway service."];
      return errors;
  }
}
