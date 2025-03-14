import {
  checkEmail,
  checkUuid,
  FieldValidation,
  isRealDob,
} from "@/validation/user_fields";
import { GatewayError } from "../api";
import { AddAllowanceCmd, UpdateAllowanceCmd } from "@/components/forms";

// converting user input in dollars to cents
export function convertDollarsToCents(dollars: string) {
  const amount = parseFloat(dollars);
  if (isNaN(amount)) {
    return 0;
  }
  return Math.round(amount * 100);
}

// converting response from cents to dollars for user display
export function convertCentsToDollars(cents: number | undefined) {
  if (!cents) {
    return 0;
  }
  if (isNaN(cents) || cents < 0) {
    return 0;
  }

  return parseFloat((cents / 100).toFixed(2));
}

export function validateAddAllowanceCmd(cmd: AddAllowanceCmd) {
  let errors: { [key: string]: string[] } = {};

  // check csrf
  if (
    cmd.csrf &&
    cmd.csrf.trim().length === 16 &&
    cmd.csrf.trim().length > 64
  ) {
    errors.csrf = [
      "CSRF token is not well formed.  My cannot edit or tamper with this value.",
    ];
  }

  // check username
  if (!cmd.username || cmd.username.trim().length === 0) {
    errors.username = ["Email/username address is required."];
  }

  if (cmd.username && cmd.username.trim().length > 0) {
    const usernameCheck: FieldValidation = checkEmail(cmd.username);
    if (!usernameCheck.isValid) {
      errors.username = usernameCheck.messages;
    }
  }

  if (!cmd.slug || cmd.slug.trim().length < 1) {
    errors.slug = ["Slug is required."];
  }

  if (!cmd.birth_date || cmd.birth_date.trim().length < 1) {
    errors.birth_date = ["Birth date is required."];
  }

  const dobCheck: FieldValidation = isRealDob(cmd.birth_date);
  if (!dobCheck.isValid) {
    errors.birth_date = dobCheck.messages;
  }

  return errors;
}

export function handleAllowanceAddErrors(gatewayError: GatewayError) {
  const errors: { [key: string]: string[] } = {};
  switch (gatewayError.code) {
    case 400:
      errors.server = [gatewayError.message];
      return errors;
    case 401:
      errors.server = [gatewayError.message];
      return errors;
    case 403:
      errors.server = [gatewayError.message];
      return errors;
    case 404:
      errors.server = [gatewayError.message];
      return errors;
    case 405:
      errors.server = [gatewayError.message];
      return errors;
    case 409:
      errors.server = [gatewayError.message];
      return errors;
    case 422:
      errors.server = [gatewayError.message];
      return errors;
    default:
      errors.server = ["Unhandled error calling gateway service."];
      return errors;
  }
}

export function validateUpdateAllowanceCmd(cmd: UpdateAllowanceCmd) {
  let errors: { [key: string]: string[] } = {};

  // check csrf
  if (!cmd.csrf) {
    errors.server = ["CSRF token is missing. This value is required."];
  } else {
    const checkCsrf = checkUuid(cmd.csrf);
    if (!checkCsrf.isValid) {
      errors.server = [
        "Csrf token is not well formed. This value is required and cannot be tampered with.",
      ];
    }
  }

  // check credit
  if (cmd.credit && isNaN(cmd.credit)) {
    errors.credit = ["Credit must be a number, zero or greater."];
  }

  if (cmd.credit && cmd.credit < 0) {
    errors.credit = ["Credit cannot be negative."];
  }

  if (cmd.credit && cmd.credit > 1000000) {
    errors.credit = [
      "Credit cannot be greater than 10,000, because that is ridiculous.",
    ];
  }

  // check debit
  if (cmd.debit && isNaN(cmd.debit)) {
    errors.debit = ["Debit must be a number, zero or greater."];
  }

  if (cmd.debit && cmd.debit < 0) {
    errors.debit = ["Debit cannot be negative."];
  }

  if (cmd.debit && cmd.debit > 1000000) {
    errors.debit = [
      "Debit cannot be greater than 10,000, because that is ridiculous.",
    ];
  }

  // account statuses
  if ((cmd.credit && cmd.credit > 0) || (cmd.debit && cmd.debit > 0)) {
    if (cmd.is_archived || !cmd.is_active || !cmd.is_calculated) {
      errors.server = [
        "Cannot set account to archived, inactive, or uncalculated when both credit and debit are greater than zero.",
      ];
    }
  }

  if (cmd.is_archived && cmd.is_active) {
    errors.is_archived = ["Cannot set account to both archived and active."];
  }

  if (cmd.is_archived && cmd.is_calculated) {
    errors.is_archived = [
      "Cannot set account to both archived and calculated.",
    ];
  }

  if (!cmd.is_active && cmd.is_calculated) {
    errors.is_active = ["Cannot set account to both inactive and calculated."];
  }

  

  return errors;
}

export function handleAllowanceUpdateErrors(gatewayError: GatewayError) {
  const errors: { [key: string]: string[] } = {};
  console.log("gatewayError", gatewayError);
  switch (gatewayError.code) {
    case 400:
      errors.server = [gatewayError.message];
      return errors;
    case 401:
      errors.server = [gatewayError.message];
      return errors;
    case 403:
      errors.server = [gatewayError.message];
      return errors;
    case 404:
      errors.server = [gatewayError.message];
      return errors;
    case 405:
      errors.server = [gatewayError.message];
      return errors;
    case 409:
      errors.server = [gatewayError.message];
      return errors;
    case 422:
      switch (true) {
        case gatewayError.message.includes("debit"):
          errors.debit = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("credit"):
          errors.credit = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("cannot set account to archived"):
          errors.is_archived = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("cannot set account to active"):
          errors.is_active = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("cannot set account to calculated"):
          errors.is_calculated = [gatewayError.message];
          return errors;
        default:
          errors.server = [gatewayError.message];
          return errors;
      }
    default:
      errors.server = ["Unhandled error generated by gateway service."];
      return errors;
  }
}
