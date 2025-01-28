"use server";

import { Scope, ScopeActionCmd } from "..";

export async function handleScopeEdit(
  previousState: ScopeActionCmd,
  formData: FormData
) {
  // light-weight validation of csrf token
  // true validation happpens in the gateway
  const csrf = previousState.csrf;
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    throw new Error(
      "CSRF token missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  let updated: Scope = {
    service_name: formData.get("service_name") as string,
    scope: formData.get("scope") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    slug: formData.get("slug") as string,
  };

  const errors = {};

  // TODO: validate form data

  // TODO: call gateway to update scope record

  return {
    csrf: csrf,
    scope: updated,
    errors: errors,
  } as ScopeActionCmd;
}
