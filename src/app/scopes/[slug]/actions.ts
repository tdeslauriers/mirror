"use server";

import { Scope, ScopeActionCmd, validateScope } from "..";

export async function handleScopeEdit(
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

  // if this is tampered with, the gateway will simply error because the slug will not be found
  const slug = previousState.slug;
  if (!slug) {
    throw new Error(
      "Scope slug is missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  let updated: Scope = {
    // TODO: update service name to be dropdown
    service_name: formData.get("service_name") as string,
    scope: formData.get("scope") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    active: formData.get("active") === "on" ? true : false,
  };
  console.log(updated);

  // validate form data
  const errors = validateScope(updated);

  // TODO: call gateway to update scope record

  return {
    csrf: csrf,
    slug: slug,
    scope: updated,
    errors: errors,
  } as ScopeActionCmd;
}
