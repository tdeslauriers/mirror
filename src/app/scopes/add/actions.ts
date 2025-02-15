"use server";

import { validateScope } from "..";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GatewayError, isGatewayError } from "@/app/api";
import { Scope, ScopeActionCmd } from "@/components/forms";

export async function handleScopeAdd(
  previousState: ScopeActionCmd,
  formData: FormData
) {
  // light-weight validation of csrf token
  // true validation happpens in the gateway
  const csrf = previousState.csrf;
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    throw new Error(
      "CSRF token is missing or not well formed.  This value is required and cannot be tampered with."
    );
  }
  // slug unnecessary, will be dropped even if submitted (which would be tampering from this page)
  let add: Scope = {
    csrf: csrf,

    service_name: formData.get("service_name") as string,
    scope: formData.get("scope") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    active: formData.get("active") === "on" ? true : false,
  };

  // validate form data
  const errors = validateScope(add);
  if (errors && Object.keys(errors).length > 0) {
    return {
      csrf: csrf,
      scope: add,
      errors: errors,
    } as ScopeActionCmd;
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

  // send form data to gateway
  try {
    const response = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/scopes/add`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${hasSession.value}`,
        },
        body: JSON.stringify(add),
      }
    );

    if (response.ok) {
      add = await response.json();
      console.log("Scope record added successfully: ", add);
    } else {
      const fail = await response.json();
      if (isGatewayError(fail)) {
        const errors = handleScopeErrors(fail);
        return {
          csrf: csrf,
          scope: add,
          errors: errors,
        } as ScopeActionCmd;
      }
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to add scope record.");
  }
  redirect("/scopes");
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
