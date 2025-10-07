"use server";

import { AllowanceActionCmd, UpdateAllowanceCmd } from "@/components/forms";
import {
  convertCentsToDollars,
  convertDollarsToCents,
  handleAllowanceUpdateErrors,
  validateUpdateAllowanceCmd,
} from "..";
import { isGatewayError } from "@/app/api";
import { getAuthCookies, getSessionCookie } from "@/components/checkCookies";
export async function handleAccountEdit(
  previousState: AllowanceActionCmd,
  formData: FormData
) {
  // get form data and prepare update object
  const csrf = previousState.csrf;

  let updated: UpdateAllowanceCmd = {
    csrf: csrf,

    credit: convertDollarsToCents(formData.get("credit") as string),
    debit: convertDollarsToCents(formData.get("debit") as string),
    is_archived: formData.get("is_archived") === "on" ? true : false,
    is_active: formData.get("is_active") === "on" ? true : false,
    is_calculated: formData.get("is_calculated") === "on" ? true : false,
  };

  // get session cookie
  const cookieResult = await getAuthCookies(`/account`);
  if (!cookieResult.ok) {
    console.log(
      `failed to get auth cookies for user attempting to update their allowance account: ${
        cookieResult.error ? cookieResult.error.message : "unknown error"
      }`
    );
    return {
      csrf: csrf,

      credit: convertCentsToDollars(updated.credit),
      debit: convertCentsToDollars(updated.debit),
      allowance: previousState.allowance,
      errors: {
        server: [
          `Failed to verify authentication cookies. Please login again and try to update your allowance account.`,
        ],
      },
    } as AllowanceActionCmd;
  }

  // light-weight validation of csrf token
  // true validation happpens in the gateway
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    console.log(
      `user ${cookieResult.data.identity?.username} submitted CSRF token which is missing or not well formed.`
    );
    return {
      csrf: csrf,

      credit: convertCentsToDollars(updated.credit),
      debit: convertCentsToDollars(updated.debit),
      allowance: previousState.allowance,
      errors: {
        csrf: [
          "CSRF token is missing or not well formed.  This value is required and cannot be tampered with.",
        ],
      },
    } as AllowanceActionCmd;
  }

  // field level validation including business logic validation.
  const errors = validateUpdateAllowanceCmd(updated);
  if (Object.keys(errors).length > 0) {
    console.log(
      `user ${
        cookieResult.data.identity?.username
      } submitted allowance account data which did not pass validation: ${JSON.stringify(
        errors
      )}`
    );
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
          Authorization: `${cookieResult.data.session}`,
        },
        body: JSON.stringify(updated),
      }
    );

    if (apiResponse.ok) {
      const success = await apiResponse.json();
      console.log(
        `user ${cookieResult.data.identity?.username} successfully updated their allowance account.`
      );
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
        console.log(
          `user ${cookieResult.data.identity?.username} received unexpected error while attempting to update their allowance account: ${apiResponse.status} ${apiResponse.statusText}`
        );
        return {
          csrf: csrf,
          slug: null, // no slug to return because user's account only
          credit: convertCentsToDollars(updated.credit),
          debit: convertCentsToDollars(updated.debit),
          allowance: previousState.allowance,
          errors: {
            server: [
              `An unhandled gateway error occurred when attempting to update your allowance account.  Please try again. If the problem persists, please contact me.`,
            ],
          },
        } as AllowanceActionCmd;
      }
    }
  } catch (error: any) {
    console.log(
      `user ${cookieResult.data.identity?.username} encountered an error when attempting to update their allowance account: ${error}`
    );
    return {
      csrf: csrf,
      slug: null, // no slug to return because user's account only
      credit: convertCentsToDollars(updated.credit),
      debit: convertCentsToDollars(updated.debit),
      allowance: previousState.allowance,
      errors: {
        server: [
          `An error occurred when attempting to update your allowance account. Please try again. If the problem persists, please contact me.`,
        ],
      },
    } as AllowanceActionCmd;
  }
}
