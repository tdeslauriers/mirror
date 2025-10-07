"use server";

import { ProfileActionCmd, validateUpdateProfile } from "@/app/profile";
import {
  ServicePermission,
  User,
  UserPermissionsCmd as EntityPermissionsCmd,
  UserScopesCmd,
} from "..";
import { ErrMsgGeneric, GatewayError, isGatewayError } from "@/app/api";
import {
  EntityPermissionsActionCmd,
  EntityScopesActionCmd,
} from "@/components/forms";
import { validateScopeSlugs } from "@/app/services";
import { validatePermissionSlugs } from "@/app/permissions";
import { getAuthCookies, getSessionCookie } from "@/components/checkCookies";

export async function handleUserEdit(
  previousState: ProfileActionCmd,
  formData: FormData
) {
  // get form data
  const csrf = previousState.csrf;
  const slug = previousState.slug;

  let updated: User = {
    csrf: csrf ?? "",

    firstname: formData.get("firstname") as string,
    lastname: formData.get("lastname") as string,
    birth_year: parseInt(formData.get("birthYear") as string),
    birth_month: parseInt(formData.get("birthMonth") as string),
    birth_day: parseInt(formData.get("birthDay") as string),
    enabled: formData.get("enabled") === "on" ? true : false,
    account_expired: formData.get("account_expired") === "on" ? true : false,
    account_locked: formData.get("account_locked") === "on" ? true : false,
  };

  // get session token
  const cookies = await getAuthCookies("/users");
  if (!cookies.ok) {
    console.log(
      `User update failed because could not verify session cookies: ${
        cookies.error ? cookies.error.message : "unknown error"
      }`
    );
    return {
      csrf: csrf,
      slug: slug,
      profile: updated,
      errors: {
        server: [
          cookies.error?.message || "unknown error related to session cookies.",
        ],
      },
    } as ProfileActionCmd;
  }

  // light-weight validation of csrf token
  // true validation happpens in the gateway
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    console.log(
      `User ${cookies.data.identity?.username} submitted empty or invalid CSRF token.`
    );
    return {
      csrf: null,
      slug: slug,
      profile: updated,
      errors: {
        server: ["CSRF token is required and cannot be tampered with."],
      },
    } as ProfileActionCmd;
  }

  // light-weight validation of user slug
  // true validation happens in the gateway
  if (!slug || slug.trim().length < 16 || slug.trim().length > 64) {
    console.log(
      `User ${cookies.data.identity?.username} submitted empty or invalid user slug.`
    );
    return {
      csrf: csrf,
      slug: undefined,
      profile: updated,
      errors: {
        server: ["User slug is required and cannot be tampered with."],
      },
    } as ProfileActionCmd;
  }

  // field validation
  const errors = validateUpdateProfile(updated);
  if (errors && Object.keys(errors).length > 0) {
    console.log(
      `User ${
        cookies.data.identity?.username
      } submitted invalid user profile update: ${JSON.stringify(errors)}`
    );
    return { csrf: csrf, profile: updated, errors: errors } as ProfileActionCmd;
  }

  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/users/${slug}`,
      {
        method: "PUT",
        headers: {
          Content_Type: "application/json",
          Authorization: `${cookies.data.session}`,
        },
        body: JSON.stringify(updated),
      }
    );

    if (apiResponse.ok) {
      const success = await apiResponse.json();
      console.log(
        `User ${cookies.data.identity?.username} successfully updated user ${updated.username}.`
      );
      return {
        csrf: csrf,
        slug: slug,
        profile: success,
        errors: errors,
      } as ProfileActionCmd;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleUserUpdateErrors(fail);
        console.log(
          `User ${
            cookies.data.identity?.username
          } user update failed: ${JSON.stringify(errors)}`
        );
        return {
          csrf: csrf,
          slug: slug,
          profile: updated,
          errors: errors,
        } as ProfileActionCmd;
      } else {
        console.log(
          `User ${cookies.data.identity?.username} user update failed due to unhandled gateway error.`
        );
        return {
          csrf: csrf,
          slug: slug,
          profile: updated,
          errors: { server: ["Unhandled gateway error.  Please try again."] },
        } as ProfileActionCmd;
      }
    }
  } catch (error) {
    if ((error as Error).message) {
      console.log(
        `User ${cookies.data.identity?.username} user update failed: ${
          (error as Error).message
        }`
      );
      return {
        csrf: csrf,
        slug: slug,
        profile: updated,
        errors: { server: [(error as Error).message] },
      } as ProfileActionCmd;
    }
    console.log(
      `User ${cookies.data.identity?.username} user update failed due to unknown error.`
    );
    return {
      csrf: csrf,
      slug: slug,
      profile: updated,
      errors: { server: ["Unknown error.  Please try again."] },
    } as ProfileActionCmd;
  }
}

// handles socpes update
export async function handleScopesUpdate(
  previousState: EntityScopesActionCmd,
  formData: FormData
) {
  // get form data
  const csrf = previousState.csrf;
  const slug = previousState.entitySlug;

  // get auth cookies
  const cookies = await getAuthCookies("/users");
  if (!cookies.ok) {
    console.log(
      `User scopes update failed because could not verify session cookies: ${
        cookies.error ? cookies.error.message : "unknown error"
      }`
    );
    return {
      csrf: csrf,
      entitySlug: slug,
      errors: {
        server: [
          cookies.error?.message || "unknown error related to session cookies.",
        ],
      },
    } as EntityScopesActionCmd;
  }

  // lightweight validation of csrf token
  // true validation happens in the gateway
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    console.log(
      `User ${cookies.data.identity?.username} submitted empty or invalid CSRF token.`
    );
    return {
      csrf: null,
      entitySlug: slug,
      errors: {
        csrf: ["CSRF token is required and cannot be tampered with."],
      },
    } as EntityScopesActionCmd;
  }

  // if this is tampered with, the gateway will error because
  // the slug will not be found, or invalid, etc.
  if (!slug || slug.trim().length < 16 || slug.trim().length > 64) {
    console.log(
      `User ${cookies.data.identity?.username} submitted empty or invalid user slug.`
    );
    return {
      csrf: csrf,
      entitySlug: null,
      errors: {
        server: ["User slug is required and cannot be tampered with."],
      },
    } as EntityScopesActionCmd;
  }

  // get slugs from form data
  // Note: array of scope slugs
  const scopeSlugs = formData.getAll("scopes[]") as string[];

  // remove prepended service from scope slugs -> not needed for scopes, just for permissions
  scopeSlugs.forEach((s, i) => {
    // if the scope slug is prepended with a service name, remove it
    if (s.includes("_")) {
      scopeSlugs[i] = s.split("_")[1];
    }
  });

  //  validate scope slugs are well formed uuids
  const errors = validateScopeSlugs(scopeSlugs);
  if (errors && Object.keys(errors).length > 0) {
    console.log(
      `User ${
        cookies.data.identity?.username
      } submitted invalid scope slugs: ${JSON.stringify(errors)}`
    );
    return {
      csrf: csrf,
      entitySlug: slug,
      errors: errors,
    } as EntityScopesActionCmd;
  }

  const cmd: UserScopesCmd = {
    csrf: csrf,
    user_slug: slug,
    scope_slugs: scopeSlugs,
  };

  // call the gateway to update the service client scopes
  // Note: only the slug values submitted with the entity uuid and csrf.
  // No need to send the entire scope or entity values.
  // The gateway services will look everything up or error if not found.
  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/users/scopes`,
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
        `User ${cookies.data.identity?.username} successfully updated scopes for user ${slug}.`
      );
      return {
        csrf: csrf,
        entitySlug: slug,
        errors: {},
      } as EntityScopesActionCmd;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleUserUpdateErrors(fail);
        console.log(
          `User ${
            cookies.data.identity?.username
          } scopes update failed: ${JSON.stringify(errors)}`
        );
        return {
          csrf: csrf,
          entitySlug: slug,
          errors: errors,
        } as EntityScopesActionCmd;
      } else {
        console.log(
          `User ${cookies.data.identity?.username} scopes update failed due to unhandled gateway error.`
        );
        return {
          csrf: csrf,
          entitySlug: slug,
          errors: {
            server: [
              "Failed to update scopes due to unhandled gateway error.  Please try again.",
            ],
          },
        } as EntityScopesActionCmd;
      }
    }
  } catch (error) {
    console.log(
      `User ${cookies.data.identity?.username} scopes update failed due to unknown error.`
    );
    return {
      csrf: csrf,
      entitySlug: slug,
      errors: {
        server: [
          "Failed to update scopes due to unknown error.  Please try again.",
        ],
      },
    } as EntityScopesActionCmd;
  }
}

// handles permissions update
export async function handlePermissionsUpdate(
  previousState: EntityPermissionsActionCmd,
  formData: FormData
) {
  const csrf = previousState.csrf;
  const slug = previousState.entitySlug;

  // get form data
  // Note: array of permission slugs
  const permissionSlugs = formData.getAll("permissions[]") as string[];

  // get auth cookies
  const cookies = await getAuthCookies("/users");
  if (!cookies.ok) {
    console.log(
      `User permissions update failed because could not verify session cookies: ${
        cookies.error ? cookies.error.message : "unknown error"
      }`
    );
    return {
      csrf: csrf,
      entitySlug: slug,
      errors: {
        server: [
          cookies.error?.message || "unknown error related to session cookies.",
        ],
      },
    } as EntityPermissionsActionCmd;
  }

  // lightweight validation of csrf token
  // true validation happens in the gateway
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    console.log(
      `User ${cookies.data.identity?.username} submitted empty or invalid CSRF token.`
    );
    return {
      csrf: null,
      entitySlug: slug,
      errors: {
        csrf: ["CSRF token is required and cannot be tampered with."],
      },
    } as EntityPermissionsActionCmd;
  }

  // if this is tampered with, the gateway will error because
  // the slug will not be found, or invalid, etc.
  if (!slug || slug.trim().length < 16 || slug.trim().length > 64) {
    console.log(
      `User ${cookies.data.identity?.username} submitted empty or invalid user slug.`
    );
    return {
      csrf: csrf,
      entitySlug: null,
      errors: {
        server: ["User slug is required and cannot be tampered with."],
      },
    } as EntityPermissionsActionCmd;
  }

  // validate permission slugs are well formed uuids
  // Note: re-using the scopes slug validation function -> slugs are uuids for both
  const errors = validatePermissionSlugs(permissionSlugs);
  if (errors && Object.keys(errors).length > 0) {
    console.log(
      `User ${
        cookies.data.identity?.username
      } submitted invalid permission slugs: ${JSON.stringify(errors)}`
    );
    return {
      csrf: csrf,
      entitySlug: slug,
      errors: errors,
    } as EntityPermissionsActionCmd;
  }

  // prepare the service permissions array for update cmd
  let svcPermissions: ServicePermission[] = [];
  permissionSlugs.forEach((s) => {
    // if the permission slug is prepended with a service name, remove it
    if (s.includes("_")) {
      const parts = s.split("_");
      svcPermissions.push({
        service_name: parts[0],
        permission_slug: parts[1],
      });
    }
  });

  // create the command to send to the gateway
  const cmd: EntityPermissionsCmd = {
    csrf: csrf,
    entity_slug: slug,
    service_permissions: svcPermissions,
  };

  // call the gateway to update the service client permissions
  // Note: only the slug values submitted with the entity uuid and csrf.
  // No need to send the entire permission or entity values.
  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/users/permissions`,
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
        `User ${cookies.data.identity?.username} successfully updated permissions for user ${slug}.`
      );
      return {
        csrf: csrf,
        entitySlug: slug,
        errors: {},
      } as EntityPermissionsActionCmd;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleUserUpdateErrors(fail);
        console.log(
          `User ${
            cookies.data.identity?.username
          } permissions update failed: ${JSON.stringify(errors)}`
        );
        return {
          csrf: csrf,
          entitySlug: slug,
          errors: errors,
        } as EntityPermissionsActionCmd;
      } else {
        console.log(
          `User ${cookies.data.identity?.username} permissions update failed due to unhandled gateway error.`
        );
        return {
          csrf: csrf,
          entitySlug: slug,
          errors: {
            server: [
              "Failed to update permissions due to unhandled gateway error.  Please try again.",
            ],
          },
        } as EntityPermissionsActionCmd;
      }
    }
  } catch (error) {
    console.log(
      `User ${cookies.data.identity?.username} permissions update failed due to unknown error.`
    );
    return {
      csrf: csrf,
      entitySlug: slug,
      errors: {
        server: [
          "Failed to update permissions due to unknown error.  Please try again.",
        ],
      },
    } as EntityPermissionsActionCmd;
  }
}

// handles user/scopes/permissions update errors returned from the gateway
function handleUserUpdateErrors(gatewayError: GatewayError) {
  const errors: { [key: string]: string[] } = {};

  switch (gatewayError.code) {
    case 400:
      errors.server = [gatewayError.message];
      return errors;
    case 401:
      errors.server = [gatewayError.message];
    case 403:
      errors.server = [gatewayError.message];
    case 404:
      errors.server = [gatewayError.message];
    case 405:
      errors.server = [gatewayError.message];
      return errors;
    case 422:
      // temporary fix for now: determine which error received
      switch (true) {
        case gatewayError.message.includes("firstname"):
          errors.firstname = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("lastname"):
          errors.lastname = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("birthdate"):
          errors.birthdate = [gatewayError.message];
          return errors;
        default:
          break;
      }
    default:
      errors.server = [gatewayError.message || ErrMsgGeneric];
      return errors;
  }
}
