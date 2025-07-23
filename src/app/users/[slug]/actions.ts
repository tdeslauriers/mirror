"use server";

import { ProfileActionCmd, validateUpdateProfile } from "@/app/profile";
import {
  ServicePermission,
  User,
  UserPermissionsCmd as EntityPermissionsCmd,
  UserScopesCmd,
} from "..";
import { cookies } from "next/headers";
import { ErrMsgGeneric, GatewayError, isGatewayError } from "@/app/api";
import {
  EntityPermissionsActionCmd,
  EntityScopesActionCmd,
} from "@/components/forms";
import { validateScopeSlugs } from "@/app/services";
import { validatePermissionSlugs } from "@/app/permissions";

export async function handleUserEdit(
  previousState: ProfileActionCmd,
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
      "User update CSRF token missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  const slug = previousState.slug;
  if (!slug || slug.trim().length < 16 || slug.trim().length > 64) {
    throw new Error(
      "User slug is missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  let updated: User = {
    csrf: csrf,

    firstname: formData.get("firstname") as string,
    lastname: formData.get("lastname") as string,
    birth_year: parseInt(formData.get("birthYear") as string),
    birth_month: parseInt(formData.get("birthMonth") as string),
    birth_day: parseInt(formData.get("birthDay") as string),
    enabled: formData.get("enabled") === "on" ? true : false,
    account_expired: formData.get("account_expired") === "on" ? true : false,
    account_locked: formData.get("account_locked") === "on" ? true : false,
  };

  // field validation
  const errors = validateUpdateProfile(updated);
  if (errors && Object.keys(errors).length > 0) {
    return { csrf: csrf, profile: updated, errors: errors } as ProfileActionCmd;
  }

  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/users/${slug}`,
      {
        method: "PUT",
        headers: {
          Content_Type: "application/json",
          Authorization: `${hasSession?.value}`,
        },
        body: JSON.stringify(updated),
      }
    );

    if (apiResponse.ok) {
      const success = await apiResponse.json();
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
        return {
          csrf: csrf,
          slug: slug,
          profile: updated,
          errors: errors,
        } as ProfileActionCmd;
      }
    }
  } catch (error) {
    throw new Error(ErrMsgGeneric);
  }

  return {
    csrf: csrf,
    slug: slug,
    profile: updated,
    errors: errors,
  } as ProfileActionCmd;
}

// handles socpes update
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
  const slug = previousState.entitySlug;
  if (!slug || slug.trim().length < 16 || slug.trim().length > 64) {
    throw new Error(
      "Service client slug is missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  // get form data
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
          Authorization: `${hasSession?.value}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cmd),
      }
    );

    if (apiResponse.ok) {
      return {
        csrf: csrf,
        entitySlug: slug,
        errors: {},
      } as EntityScopesActionCmd;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleUserUpdateErrors(fail);
        return {
          csrf: csrf,
          entitySlug: slug,
          errors: errors,
        } as EntityScopesActionCmd;
      } else {
        throw new Error(
          "An unhandled gateway error occured when attempting to update user scopes.  Please try again."
        );
      }
    }
  } catch (error) {
    throw new Error(
      "User scopes form could not be updated.  Please try again."
    );
  }
}

// handles permissions update
export async function handlePermissionsUpdate(
  previousState: EntityPermissionsActionCmd,
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
  const slug = previousState.entitySlug;
  if (!slug || slug.trim().length < 16 || slug.trim().length > 64) {
    throw new Error(
      "Service client slug is missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  // get form data
  // Note: array of permission slugs
  const permissionSlugs = formData.getAll("permissions[]") as string[];
  // validate permission slugs are well formed uuids
  // Note: re-using the scopes slug validation function -> slugs are uuids for both
  const errors = validatePermissionSlugs(permissionSlugs);
  if (errors && Object.keys(errors).length > 0) {
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
  console.log("cmd", cmd);

  // call the gateway to update the service client permissions
  // Note: only the slug values submitted with the entity uuid and csrf.
  // No need to send the entire permission or entity values.
  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/users/permissions`,
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
        entitySlug: slug,
        errors: {},
      } as EntityPermissionsActionCmd;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleUserUpdateErrors(fail);
        return {
          csrf: csrf,
          entitySlug: slug,
          errors: errors,
        } as EntityPermissionsActionCmd;
      } else {
        throw new Error(
          "An unhandled gateway error occured when attempting to update user permissions.  Please try again."
        );
      }
    }
  } catch (error) {
    throw new Error(
      "Unhandled error occured when attempting to update user permissions.  Please try again."
    );
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
