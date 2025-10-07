"use server";

import { Scope, ScopeActionCmd, validateScope } from "..";
import { GatewayError, isGatewayError } from "@/app/api";

import { getAuthCookies, getSessionCookie } from "@/components/checkCookies";

export async function handleScopeEdit(
  previousState: ScopeActionCmd,
  formData: FormData
) {
  // get form data
  const csrf = previousState.csrf;
  const slug = previousState.slug;

  let updated: Scope = {
    csrf: csrf ?? "",

    // TODO: update service name to be dropdown
    service_name: formData.get("service_name") as string,
    scope: formData.get("scope") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    active: formData.get("active") === "on" ? true : false,
  };

  // get auth cookies
  const cookies = await getAuthCookies(`/scopes/${slug}`);
  if (!cookies.ok) {
    console.log(
      `Scope update failed because could not verify session cookies: ${
        cookies.error ? cookies.error.message : "unknown error"
      }`
    );
    return {
      csrf: csrf,
      slug: slug,
      scope: updated,
      errors: {
        server: [
          cookies.error
            ? cookies.error.message
            : "unknown error related to session cookies.",
        ],
      },
    } as ScopeActionCmd;
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
      scope: updated,
      errors: {
        csrf: [
          "CSRF token missing or not well formed. This value is required and cannot be tampered with.",
        ],
      },
    } as ScopeActionCmd;
  }

  // if this is tampered with, the gateway will simply error because
  // the slug will not be found, or invalid, etc.
  if (!slug || slug.trim().length < 16 || slug.trim().length > 64) {
    console.log(
      `User ${cookies.data.identity?.username} submitted a scope slug which is missing or not well formed.`
    );
    return {
      csrf: csrf,
      slug: slug,
      scope: updated,
      errors: {
        server: [
          "Scope slug is missing or not well formed. This value is required and cannot be tampered with.",
        ],
      },
    } as ScopeActionCmd;
  }

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
          Authorization: `${cookies.data.session}`,
          Content_Type: "application/json",
        },
        body: JSON.stringify(updated),
      }
    );

    if (apiResponse.ok) {
      const success = await apiResponse.json();
      console.log(
        `Scope record ${slug} updated successfully by user ${cookies.data.identity?.username}.`
      );
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

        console.log(
          `Scope record ${slug} update failed for user ${
            cookies.data.identity?.username
          }: ${JSON.stringify(errors)}`
        );
        return {
          csrf: csrf,
          slug: slug,
          scope: updated,
          errors: errors,
        } as ScopeActionCmd;
      } else {
        console.error(
          `Scope record ${slug} update failed for user ${cookies.data.identity?.username} due to unhandled gateway error: ${fail.message}`
        );
        return {
          csrf: csrf,
          slug,
          scope: updated,
          errors: {
            server: [
              fail.message
                ? fail.message
                : "Scope update failed due to an unhandled gateway error.",
            ],
          },
        } as ScopeActionCmd;
      }
    }
  } catch (error) {
    console.error(
      `Scope record ${slug} update failed for user ${cookies.data.identity?.username}: ${error}`
    );
    return {
      csrf: csrf,
      slug: slug,
      scope: updated,
      errors: {
        server: ["Scope update failed due to an unhandled gateway error."],
      },
    } as ScopeActionCmd;
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
