"use server";

import {
  AddAllowanceActionCmd,
  AddAllowanceCmd,
  validateAddAllowanceCmd,
} from "..";

export async function handleAddAllowance(
  previousState: AddAllowanceActionCmd,
  formData: FormData
) {
  const csrf = previousState.csrf;
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    throw new Error(
      "CSRF token is missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  let add: AddAllowanceCmd = {
    csrf: csrf,

    username: formData.get("username") as string,
    slug: formData.get("slug") as string,
    birth_date: formData.get("birth_date") as string,
  };

  // light weight validation: actual values will be validated by gateway
  const errors = validateAddAllowanceCmd(add);

  return {
    csrf: csrf,
    username: add.username,
    slug: add.slug,
    birth_date: add.birth_date,
    errors: errors,
  } as AddAllowanceActionCmd;
}
