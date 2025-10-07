"use server";

import { GeneratePatCmd, ServiceClient } from "@/app/services";
import {
  ResetData,
  ResetPwActionCmd,
  EntityScopesActionCmd,
  ServiceClientActionCmd,
  validatePasswords,
} from "@/components/forms";
import {
  ClientScopesCmd,
  PatActionCmd,
  handleServiceClientErrors,
  validateGeneratePatCmd,
  validateScopeSlugs,
  validateServiceClient,
} from "..";

import { isGatewayError } from "@/app/api";
import { getAuthCookies, getSessionCookie } from "@/components/checkCookies";
import { cookies } from "next/headers";

export async function handleClientEdit(
  previousState: ServiceClientActionCmd,
  formData: FormData
) {
  const csrf = previousState.csrf;
  const slug = previousState.slug;

  // get form data
  let updated: ServiceClient = {
    csrf: csrf ?? "",

    name: formData.get("name") as string,
    owner: formData.get("owner") as string,
    enabled: formData.get("enabled") === "on" ? true : false,
    account_expired: formData.get("account_expired") === "on" ? true : false,
    account_locked: formData.get("account_locked") === "on" ? true : false,
  };

  // get auth cookies
  const cookies = await getAuthCookies(`/services/${slug}`);
  if (!cookies.ok) {
    console.log(
      `Service client update failed because could not verify session cookies: ${
        cookies.error ? cookies.error.message : "unknown error"
      }`
    );
    return {
      csrf: csrf,
      slug: slug,
      serviceClient: updated,
      errors: {
        server: [
          cookies.error
            ? cookies.error.message
            : "unknown error related to session cookies.",
        ],
      },
    } as ServiceClientActionCmd;
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
      serviceClient: updated,
      errors: {
        csrf: [
          "CSRF token is missing or not well formed.  This value is required and cannot be tampered with.",
        ],
      },
    } as ServiceClientActionCmd;
  }

  // if this is tampered with, the gateway will simply error because
  // the slug will not be found, or invalid, etc.
  if (!slug || slug.trim().length < 16 || slug.trim().length > 64) {
    console.log(
      `User ${cookies.data.identity?.username} submitted service client slug which is missing or not well formed.`
    );
    return {
      csrf: csrf,
      slug: slug,
      serviceClient: updated,
      errors: {
        slug: [
          "Service client slug is missing or not well formed.  This value is required and cannot be tampered with.",
        ],
      },
    } as ServiceClientActionCmd;
  }

  // validate form data
  const errors = validateServiceClient(updated);
  if (errors && Object.keys(errors).length > 0) {
    console.log(
      `Service client update validation failed for user ${
        cookies.data.identity?.username
      }: ${JSON.stringify(errors)}`
    );
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
          Authorization: `${cookies.data.session}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updated),
      }
    );

    if (apiResponse.ok) {
      const success = await apiResponse.json();
      console.log(
        `Service client record ${slug} updated successfully by user ${cookies.data.identity?.username}.`
      );
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
        console.log(
          `Service client record ${slug} update failed for user ${
            cookies.data.identity?.username
          }: ${JSON.stringify(errors)}`
        );
        return {
          csrf: csrf,
          slug: slug,
          serviceClient: updated,
          errors: errors,
        } as ServiceClientActionCmd;
      } else {
        console.error(
          `Service client record ${slug} update failed for user ${cookies.data.identity?.username} due to unhandled gateway error: ${fail.message}`
        );
        return {
          csrf: csrf,
          slug: slug,
          serviceClient: updated,
          errors: {
            server: [
              fail.message
                ? fail.message
                : "Service client update failed due to an unhandled gateway error.",
            ],
          },
        } as ServiceClientActionCmd;
      }
    }
  } catch (error) {
    console.error(
      `Service client record ${slug} update failed for user ${
        cookies.data.identity?.username
      }: ${error ? error : "reason unknown"}`
    );
    return {
      csrf: csrf,
      slug: slug,
      serviceClient: updated,
      errors: {
        server: [
          "Service client update failed due to an unhandled gateway error.",
        ],
      },
    } as ServiceClientActionCmd;
  }
}

export async function handleReset(
  previousState: ResetPwActionCmd,
  formData: FormData
) {
  // get forrm data
  const csrf = previousState.csrf;
  const resource_id = previousState.resource_id;

  const reset: ResetData = {
    csrf: csrf ?? "",
    resource_id: resource_id,

    current_password: formData.get("current_password") as string,
    new_password: formData.get("new_password") as string,
    confirm_password: formData.get("confirm_password") as string,
  };

  // get auth cookies
  const cookies = await getAuthCookies("/services");
  if (!cookies.ok) {
    console.log(
      `Password reset failed because could not verify session cookies: ${
        cookies.error ? cookies.error.message : "unknown error"
      }`
    );
    return {
      csrf: csrf,
      resource_id: resource_id,
      reset: reset,
      errors: {
        server: [
          cookies.error
            ? cookies.error.message
            : "unknown error related to session cookies.",
        ],
      },
    } as ResetPwActionCmd;
  }

  // lightweight validation of csrf token
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    console.log(
      `User ${cookies.data.identity?.username} submitted CSRF token which is missing or not well formed.`
    );
    return {
      csrf: csrf,
      resource_id: resource_id,
      reset: reset,
      errors: {
        csrf: [
          "CSRF token is missing or not well formed.  This value is required and cannot be tampered with.",
        ],
      },
    } as ResetPwActionCmd;
  }

  // lightweight validation of resource_id
  if (
    !resource_id ||
    resource_id.trim().length < 16 ||
    resource_id.trim().length > 64
  ) {
    console.log(
      `User ${cookies.data.identity?.username} submitted resource_id which is missing or not well formed.`
    );
    return {
      csrf: csrf,
      resource_id: resource_id,
      reset: reset,
      errors: {
        resource_id: [
          "Resource ID is missing or not well formed.  This value is required and cannot be tampered with.",
        ],
      },
    } as ResetPwActionCmd;
  }

  // pw field validation
  const errors = validatePasswords(reset);
  if (errors && Object.keys(errors).length > 0) {
    console.log(
      `Password reset validation failed for user ${
        cookies.data.identity?.username
      }: ${JSON.stringify(errors)}`
    );
    return {
      csrf: csrf,
      resource_id: resource_id,
      reset: reset,
      errors: errors,
    } as ResetPwActionCmd;
  }

  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/clients/reset`,
      {
        method: "POST",
        headers: {
          Authorization: `${cookies.data.session}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reset),
      }
    );

    if (apiResponse.ok) {
      console.log(
        `Password reset successfully for user ${cookies.data.identity?.username}`
      );
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
        console.log(
          `failed to reset user ${
            cookies.data.identity?.username
          }'s password: ${JSON.stringify(errors)}`
        );
        return {
          csrf: csrf,
          resource_id: resource_id,
          reset: reset,
          errors: errors,
        } as ResetPwActionCmd;
      } else {
        console.error(
          `Password reset failed for user ${cookies.data.identity?.username} due to unhandled gateway error: ${fail.message}`
        );
        return {
          csrf: csrf,
          resource_id: resource_id,
          reset: reset,
          errors: {
            server: [
              fail.message
                ? fail.message
                : "Password reset failed due to an unhandled gateway error.",
            ],
          },
        } as ResetPwActionCmd;
      }
    }
  } catch (error) {
    console.error(
      `Password reset failed for user ${cookies.data.identity?.username}: ${error}`
    );
    return {
      csrf: csrf,
      resource_id: resource_id,
      reset: reset,
      errors: {
        server: ["Password reset failed due to an unknown error."],
      },
    } as ResetPwActionCmd;
  }
}

export async function handleScopesUpdate(
  previousState: EntityScopesActionCmd,
  formData: FormData
) {
  // get form data
  const csrf = previousState.csrf;
  const slug = previousState.entitySlug;

  // get auth cookies
  const cookies = await getAuthCookies(`/services/${slug}`);
  if (!cookies.ok) {
    console.log(
      `Service client scopes update failed because could not verify session cookies: ${
        cookies.error ? cookies.error.message : "unknown error"
      }`
    );
    return {
      csrf: csrf,
      entitySlug: slug,
      errors: {
        server: [
          cookies.error
            ? cookies.error.message
            : "unknown error related to session cookies.",
        ],
      },
    } as EntityScopesActionCmd;
  }

  // lightweight validation of csrf token
  // true validation happens in the gateway
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    console.log(
      `User ${cookies.data.identity?.username} submitted CSRF token which is missing or not well formed.`
    );
    return {
      csrf: csrf,
      entitySlug: slug,
      errors: {
        csrf: [
          "CSRF token is missing or not well formed.  This value is required and cannot be tampered with.",
        ],
      },
    } as EntityScopesActionCmd;
  }

  // if this is tampered with, the gateway will error because
  // the slug will not be found, or invalid, etc.
  if (!slug || slug.trim().length < 16 || slug.trim().length > 64) {
    console.log(
      `User ${cookies.data.identity?.username} submitted service client slug which is missing or not well formed.`
    );
    return {
      csrf: csrf,
      entitySlug: slug,
      errors: {
        server: [
          "Service client slug is missing or not well formed.  This value is required and cannot be tampered with.",
        ],
      },
    } as EntityScopesActionCmd;
  }

  // get scopes slug data from form
  // Note: array of scope slugs
  const scopeSlugs = formData.getAll("scopes[]") as string[];

  // removed prepended service from scope slugs -> not needed for scopes, only permissions
  scopeSlugs.forEach((s, i) => {
    // remove prepended service name from scope slug
    // ie, "pixie_read" -> "read"
    if (s.includes("_")) {
      const parts = s.split("_");
      scopeSlugs[i] = parts[1];
    }
  });

  //  validate scope slugs are well formed uuids
  const errors = validateScopeSlugs(scopeSlugs);
  if (errors && Object.keys(errors).length > 0) {
    return {
      csrf: csrf,
      entitySlug: slug,
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
          Authorization: `${cookies.data.session}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cmd),
      }
    );

    if (apiResponse.ok) {
      console.log(
        `Service client scopes updated successfully by user ${cookies.data.identity?.username}.`
      );
      return {
        csrf: csrf,
        entitySlug: slug,
        errors: {},
      } as EntityScopesActionCmd;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleServiceClientErrors(fail);
        console.log(
          `Service client scopes update failed for user ${
            cookies.data.identity?.username
          }: ${JSON.stringify(errors)}`
        );
        return {
          csrf: csrf,
          entitySlug: slug,
          errors: errors,
        } as EntityScopesActionCmd;
      } else {
        console.error(
          `Service client scopes update failed for user ${cookies.data.identity?.username} due to unhandled gateway error: ${fail.message}`
        );
        return {
          csrf: csrf,
          entitySlug: slug,
          errors: {
            server: [
              fail.message
                ? fail.message
                : "Service client scopes update failed due to an unhandled gateway error.",
            ],
          },
        } as EntityScopesActionCmd;
      }
    }
  } catch (error) {
    console.error(
      `Service client scopes update failed for user ${
        cookies.data.identity?.username
      }: ${error ? error : "reason unknown"}`
    );
    return {
      csrf: csrf,
      entitySlug: slug,
      errors: {
        server: [
          "Service client scopes update failed due to an unhandled gateway error.",
        ],
      },
    } as EntityScopesActionCmd;
  }
}

export async function genPatToken(
  previousState: PatActionCmd,
  formData: FormData
) {
  // build generate PAT command
  const csrf = previousState.csrf;
  const slug = previousState.slug;

  // get session token
  const cookies = await getAuthCookies(`/services/${slug}`);
  if (!cookies.ok) {
    console.log(
      `Personal Access Token generation failed because could not verify session cookies: ${
        cookies.error ? cookies.error.message : "unknown error"
      }`
    );
    return {
      csrf: csrf,
      slug: slug,
      success: false,
      pat: null,
      errors: {
        server: [
          cookies.error
            ? cookies.error.message
            : "unknown error related to session cookies.",
        ],
      },
    };
  }

  // build command
  // only need csrf and slug to generate a PAT
  const cmd: GeneratePatCmd = {
    csrf: csrf,
    slug: slug,
  };

  // validate command
  const errors = validateGeneratePatCmd(cmd);
  if (errors && Object.keys(errors).length > 0) {
    console.log(
      `Personal Access Token generation validation failed for user ${
        cookies.data.identity?.username
      }: ${JSON.stringify(errors)}`
    );
    return {
      csrf: csrf,
      slug: slug,
      success: false,
      pat: null,
      errors: errors,
    };
  }

  // call gateway to generate PAT for service client record
  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/clients/generate/pat`,
      {
        method: "POST",
        headers: {
          Authorization: `${cookies.data.session}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cmd),
      }
    );

    if (apiResponse.ok) {
      const success = await apiResponse.json();
      console.log("successfully generated pat token: ", success);
      return {
        csrf: csrf,
        slug: slug,
        success: true,
        pat: success.token,
        errors: {},
      };
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleServiceClientErrors(fail);
        return {
          csrf: csrf,
          slug: slug,
          success: false,
          pat: null,
          errors: errors,
        };
      } else {
        console.error(
          `Personal Access Token generation failed for user ${
            cookies.data.identity?.username
          } due to unhandled gateway error: ${JSON.stringify(fail)}`
        );
        return {
          csrf: csrf,
          slug: slug,
          success: false,
          pat: null,
          errors: {
            server: [
              fail
                ? JSON.stringify(fail)
                : "Personal Access Token generation failed due to an unhandled gateway error.",
            ],
          },
        };
      }
    }
  } catch (error) {
    console.error(
      `Personal Access Token generation failed for user ${
        cookies.data.identity?.username
      }: ${error ? error : "reason unknown"}`
    );
    return {
      csrf: csrf,
      slug: slug,
      success: false,
      pat: null,
      errors: {
        server: [
          "Personal Access Token generation failed due to an unhandled gateway error.",
        ],
      },
    };
  }
}
