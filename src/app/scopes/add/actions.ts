"use server";

import { Scope, ScopeActionCmd, validateScope } from "..";
import { redirect } from "next/navigation";
import { GatewayError, isGatewayError } from "@/app/api";
import { getAuthCookies, getSessionCookie } from "@/components/checkCookies";
import { cookies } from "next/headers";

export async function handleScopeAdd(
  previousState: ScopeActionCmd,
  formData: FormData
) {
  const csrf = previousState.csrf;

  // slug unnecessary, will be dropped even if submitted (which would indicate tampering from this page)
  let add: Scope = {
    csrf: csrf ?? "",

    service_name: formData.get("service_name") as string,
    scope: formData.get("scope") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    active: formData.get("active") === "on" ? true : false,
  };

  // get auth cookie
  const cookies = await getAuthCookies("/scopes/add");
  if (!cookies.ok) {
    console.log(
      `Scope add failed because could not verify session cookies: ${
        cookies.error ? cookies.error.message : "unknown error"
      }`
    );
    return {
      csrf: csrf,
      // slug omitted because doesn't exist yet
      scope: add,
      errors: {
        server: [
          cookies.error?.message || "unknown error related to session cookies.",
        ],
      },
    } as ScopeActionCmd;
  }

  // light-weight validation of csrf token
  // true validation happpens in the gateway
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    console.log(
      `User ${cookies.data.identity?.username} submitted empty or invalid CSRF token.`
    );
    return {
      csrf: null,
      // slug omitted because doesn't exist yet
      scope: add,
      errors: {
        csrf: ["invalid CSRF token"],
      },
    } as ScopeActionCmd;
  }

  // validate form data
  const errors = validateScope(add);
  if (errors && Object.keys(errors).length > 0) {
    console.log(
      `User ${
        cookies.data.identity?.username
      } submitted invalid scope data: ${JSON.stringify(errors)}`
    );
    return {
      csrf: csrf,
      scope: add,
      errors: errors,
    } as ScopeActionCmd;
  }

  // send form data to gateway
  try {
    const response = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/scopes/add`,
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
      add = await response.json();
      console.log(
        `User ${cookies.data.identity?.username} successfully added scope ${add.scope} for service ${add.service_name}.`
      );
    } else {
      const fail = await response.json();
      if (isGatewayError(fail)) {
        const errors = handleScopeErrors(fail);
        console.log(
          `User ${
            cookies.data.identity?.username
          } scope creation failed: ${JSON.stringify(errors)}`
        );
        return {
          csrf: csrf,
          scope: add,
          errors: errors,
        } as ScopeActionCmd;
      } else {
        console.log(
          `User ${cookies.data.identity?.username} scope creation failed due to unhandled gateway error.`
        );
        return {
          csrf: csrf,
          scope: add,
          errors: {
            server: [
              "Failed to create scope due to unhandled gateway error.  Please try again.",
            ],
          },
        } as ScopeActionCmd;
      }
    }
  } catch (error) {
    if ((error as Error).message) {
      console.log(
        `User ${cookies.data.identity?.username} scope creation failed: ${
          (error as Error).message
        }`
      );
      return {
        csrf: csrf,
        scope: add,
        errors: {
          server: [(error as Error).message],
        },
      } as ScopeActionCmd;
    }
    console.log(
      `User ${cookies.data.identity?.username} scope creation failed due to unknown error.`
    );
    return {
      csrf: csrf,
      scope: add,
      errors: {
        server: [
          "Failed to call gateway service. If this error persists, please contact me.",
        ],
      },
    } as ScopeActionCmd;
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
