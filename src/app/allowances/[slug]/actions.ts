"use server";

import { AllowanceActionCmd, UpdateAllowanceCmd } from "@/components/forms";
import { cookies } from "next/headers";
import { handleAllowanceUpdateErrors, validateUpdateAllowanceCmd } from "..";
import { isGatewayError } from "@/app/api";
export async function handleAllowanceEdit(
  previousState: AllowanceActionCmd,
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

  // if this is tampered with, the gateway will simply error because
  // the slug will not be found, or invalid, etc.
  const slug = previousState.slug;
  if (!slug || slug.trim().length < 16 || slug.trim().length > 64) {
    throw new Error(
      "Allowance slug is missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  let updated: UpdateAllowanceCmd = {
    csrf: csrf,

    credit: parseFloat(formData.get("credit") as string),
    debit: parseFloat(formData.get("debit") as string),
    is_archived: formData.get("is_archived") === "on" ? true : false,
    is_active: formData.get("is_active") === "on" ? true : false,
    is_calculated: formData.get("is_calculated") === "on" ? true : false,
  };

  // field level validation: does not include business logic validation.
  const errors = validateUpdateAllowanceCmd(updated);
  if (Object.keys(errors).length > 0) {
    return {
      csrf: csrf,
      slug: slug,
      credit: updated.credit,
      debit: updated.debit,
      allowance: previousState.allowance,
      errors: errors,
    } as AllowanceActionCmd;
  }

  // business logic checks
  // eg. debit cannot be more than credit.
  if (updated.debit && updated.credit && updated.debit > updated.credit) {
    errors.debit = ["Debit cannot be greater than credit."];
    return {
      csrf: csrf,
      slug: slug,
      credit: updated.credit,
      debit: updated.debit,
      allowance: previousState.allowance,
      errors: errors,
    } as AllowanceActionCmd;
  }

  if (
    updated.debit &&
    previousState.allowance?.balance &&
    updated.debit > previousState.allowance.balance
  ) {
    errors.debit = ["Debit cannot be greater than balance."];
    return {
      csrf: csrf,
      slug: slug,
      credit: updated.credit,
      debit: updated.debit,
      allowance: previousState.allowance,
      errors: errors,
    } as AllowanceActionCmd;
  }

  if (updated.is_archived && (updated.is_active || updated.is_calculated)) {
    errors.is_archived = ["Cannot archive an active or calculated allowance."];
    return {
      csrf: csrf,
      slug: slug,
      credit: updated.credit,
      debit: updated.debit,
      allowance: previousState.allowance,
      errors: errors,
    } as AllowanceActionCmd;
  }

  if (updated.is_active && updated.is_archived) {
    errors.is_active = ["Cannot archive an active allowance."];
    return {
      csrf: csrf,
      slug: slug,
      credit: updated.credit,
      debit: updated.debit,
      allowance: previousState.allowance,
      errors: errors,
    } as AllowanceActionCmd;
  }

  if (updated.is_calculated && (updated.is_archived || !updated.is_active)) {
    errors.is_calculated = [
      "Cannot archive or deactivate a calculated allowance.",
    ];
    return {
      csrf: csrf,
      slug: slug,
      credit: updated.credit,
      debit: updated.debit,
      allowance: previousState.allowance,
      errors: errors,
    } as AllowanceActionCmd;
  }

  try {
    const apiResponse = await fetch(`/api/allowances/${slug}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${hasSession?.value}`,
      },
      body: JSON.stringify(updated),
    });

    if (apiResponse.ok) {
      const success = await apiResponse.json();
      return {
        csrf: csrf,
        slug: slug,
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
          slug: slug,
          allowance: updated,
          errors: errors,
        } as AllowanceActionCmd;
      }
    }
  } catch (error: any) {
    console.log(error.message);
    throw new Error(
      `Unable to call gateway successfully to update allowance account`
    );
  }

  return {
    csrf: csrf,
    slug: slug,
    credit: updated.credit,
    debit: updated.debit,
    allowance: previousState.allowance,
    errors: {},
  } as AllowanceActionCmd;
}
