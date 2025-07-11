"use server";

import { validateScope } from "..";
import { GatewayError, isGatewayError } from "@/app/api";
import { Scope, ScopeActionCmd } from "@/components/forms";
import { checkForSessionCookie } from "@/components/checkCookies";

export async function handleScopeEdit(
  previousState: ScopeActionCmd,
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

  // if this is tampered with, the gateway will simply error because
  // the slug will not be found, or invalid, etc.
  const slug = previousState.slug;
  if (!slug || slug.trim().length < 16 || slug.trim().length > 64) {
    throw new Error(
      "Scope slug is missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  let updated: Scope = {
    csrf: csrf,

    // TODO: update service name to be dropdown
    service_name: formData.get("service_name") as string,
    scope: formData.get("scope") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    active: formData.get("active") === "on" ? true : false,
  };

  // validate form data
  const errors = validateScope(updated);
  if (errors && Object.keys(errors).length > 0) {
    return {
      csrf: csrf,
      slug: slug,
      scope: updated,
      errors: errors,
    } as ScopeActionCmd;
  }

  // call gateway to update scope record
  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/scopes/${slug}`,
      {
        method: "PUT",
        headers: {
          Authorization: `${sessionCookie.value}`,
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
        scope: success as Scope,
        errors: errors,
      } as ScopeActionCmd;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleScopeErrors(fail);
        return {
          csrf: csrf,
          slug: slug,
          scope: updated,
          errors: errors,
        } as ScopeActionCmd;
      } else {
        throw new Error(
          "Scope record could not be updated due to unhandled gateway error."
        );
      }
    }
  } catch (error) {
    throw new Error("Failed to update scope record due to unhandled error.");
  }
}

function handleScopeErrors(gatewayError: GatewayError) {
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
        case gatewayError.message.includes("service_name"):
          errors.service_name = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("scope"):
          errors.scope = [gatewayError.message];
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
