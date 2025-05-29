"use server";

import { AllowanceActionCmd, UpdateAllowanceCmd } from "@/components/forms";
import {
  convertCentsToDollars,
  convertDollarsToCents,
  handleAllowanceUpdateErrors,
  validateUpdateAllowanceCmd,
} from "..";
import { isGatewayError } from "@/app/api";
import { checkForSessionCookie } from "@/components/checkCookies";
export async function handleAccountEdit(
  previousState: AllowanceActionCmd,
  formData: FormData
) {
  // get session token
  const sessionCookie = await checkForSessionCookie();

  // light-weight validation of csrf token
  // true validation happpens in the gateway
  const csrf = previousState.csrf;
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    throw new Error(
      "CSRF token is missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  let updated: UpdateAllowanceCmd = {
    csrf: csrf,

    credit: convertDollarsToCents(formData.get("credit") as string),
    debit: convertDollarsToCents(formData.get("debit") as string),
    is_archived: formData.get("is_archived") === "on" ? true : false,
    is_active: formData.get("is_active") === "on" ? true : false,
    is_calculated: formData.get("is_calculated") === "on" ? true : false,
  };

  // field level validation including business logic validation.
  const errors = validateUpdateAllowanceCmd(updated);
  if (Object.keys(errors).length > 0) {
    return {
      csrf: csrf,

      credit: convertCentsToDollars(updated.credit),
      debit: convertCentsToDollars(updated.debit),
      allowance: previousState.allowance,
      errors: errors,
    } as AllowanceActionCmd;
  }

  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/account`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${sessionCookie.value}`,
        },
        body: JSON.stringify(updated),
      }
    );

    if (apiResponse.ok) {
      const success = await apiResponse.json();
      return {
        csrf: csrf,
        slug: null, // no slug to return because user's account only
        // not returning credit/debit so fields reset to 0
        allowance: success,
        errors: errors,
      } as AllowanceActionCmd;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleAllowanceUpdateErrors(fail);
        return {
          csrf: csrf,
          slug: null, // no slug to return because user's account only
          credit: convertCentsToDollars(updated.credit),
          debit: convertCentsToDollars(updated.debit),
          allowance: previousState.allowance,
          errors: errors,
        } as AllowanceActionCmd;
      } else {
        throw new Error(
          "An unhandled gateway error occurred when trying to update allowance."
        );
      }
    }
  } catch (error: any) {
    console.log(error.message);
    throw new Error(
      `Unable to call gateway successfully to update allowance account`
    );
  }
}
