"use server";

import {
  ResetData,
  ResetPwActionCmd,
  EntityScopesActionCmd,
  ServiceClient,
  ServiceClientActionCmd,
  validatePasswords,
} from "@/components/forms";
import {
  ClientScopesCmd,
  handleServiceClientErrors,
  validateScopeSlugs,
  validateServiceClient,
} from "..";
import { cookies } from "next/headers";
import { isGatewayError } from "@/app/api";

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

  // lightweight validation of resource_id
  const resource_id = previousState.resource_id;
  if (
    !resource_id ||
    resource_id.trim().length < 16 ||
    resource_id.trim().length > 64
  ) {
    throw new Error(
      "Resource ID missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  const reset: ResetData = {
    csrf: csrf,
    resource_id: resource_id,

    current_password: formData.get("current_password") as string,
    new_password: formData.get("new_password") as string,
    confirm_password: formData.get("confirm_password") as string,
  };

  // pw field validation
  const errors = validatePasswords(reset);
  if (errors && Object.keys(errors).length > 0) {
    return {
      csrf: csrf,
      resource_id: resource_id,
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
      return {
        csrf: csrf,
        resource_id: resource_id,
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
          resource_id: resource_id,
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

export async function handleScopesUpdate(
  previousState: EntityScopesActionCmd,
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

  // lightweight validation of csrf token
  // true validation happens in the gateway
  const csrf = previousState.csrf;
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    throw new Error(
      "Scopes form CSRF token is missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  // if this is tampered with, the gateway will error because
  // the slug will not be found, or invalid, etc.
  const slug = previousState.slug;
  if (!slug || slug.trim().length < 16 || slug.trim().length > 64) {
    throw new Error(
      "Service client slug is missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  // get form data
  // Note: array of scope slugs
  const scopeSlugs = formData.getAll("scopes[]") as string[];

  //  validate scope slugs are well formed uuids
  const errors = validateScopeSlugs(scopeSlugs);
  if (errors && Object.keys(errors).length > 0) {
    return {
      csrf: csrf,
      slug: slug,
      errors: errors,
    } as EntityScopesActionCmd;
  }

  const cmd: ClientScopesCmd = {
    csrf: csrf,
    client_slug: slug,
    scope_slugs: scopeSlugs,
  };

  // call the gateway to update the service client scopes
  // Note: only the slug values submitted with the entity uuid and csrf.
  // No need to send the entire scope or entity values.
  // The gateway services will look everything up or error if not found.
  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/clients/scopes`,
      {
        method: "PUT",
        headers: {
          Authorization: `${hasSession?.value}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cmd),
      }
    );

    if (apiResponse.ok) {
      return {
        csrf: csrf,
        slug: slug,
        errors: {},
      } as EntityScopesActionCmd;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleServiceClientErrors(fail);
        return {
          csrf: csrf,
          slug: slug,
          errors: errors,
        } as EntityScopesActionCmd;
      } else {
        throw new Error(
          "Service client scopes form could not be updated.  Please try again."
        );
      }
    }
  } catch (error) {
    throw new Error(
      "Service client scopes form could not be updated.  Please try again."
    );
  }
}
