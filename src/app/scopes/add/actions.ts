import { Scope, ScopeActionCmd } from "@/components/forms/scope-form";
import { validateScope } from "..";
import { cookies } from "next/headers";

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
  }

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
}
