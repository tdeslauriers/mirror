"use server";

import { cookies } from "next/headers";
import { handleAllowanceAddErrors, validateAddAllowanceCmd } from "..";
import { isGatewayError } from "@/app/api";
import { AddAllowanceActionCmd, AddAllowanceCmd } from "@/components/forms";

const ErrMsgGeneric =
  "An error occurred: failed to add new allowance account. Please try again.";

export async function handleAddAllowance(
  previousState: AddAllowanceActionCmd,
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

  if (Object.keys(errors).length > 0) {
    return {
      csrf: csrf,
      username: add.username,
      slug: add.slug,
      birth_date: add.birth_date,
      errors: errors,
    } as AddAllowanceActionCmd;
  }

  // call gateway to add allowance
  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/allowances`,
      {
        method: "POST",
        headers: {
          Authorization: `${hasSession?.value}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(add),
      }
    );

    if (apiResponse.ok) {
      const success = await apiResponse.json();
      return {
        csrf: previousState.csrf,
        complete: true,
        username: add.username,
        slug: add.slug,
        allowance_account: success.slug,
        errors: {},
      };
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleAllowanceAddErrors(fail);
        return {
          csrf: previousState.csrf,
          complete: false,

          errors: errors,
        };
      } else {
        throw new Error("Call to gateway failed to create service account.");
      }
    }
  } catch (error) {
    throw new Error(ErrMsgGeneric);
  }
}
