import {
  checkEmail,
  checkUuid,
  FieldValidation,
  isRealDob,
} from "@/validation/user_fields";
import { GatewayError } from "../api";
import { AddAllowanceCmd, UpdateAllowanceCmd } from "@/components/forms";

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
  if (!cmd.credit) {
    errors.credit = ["Credit can be zero or greater, but cannot be missing."];
  }

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
  if (!cmd.debit) {
    errors.debit = ["Debit can be zero or greater, but cannot be missing."];
  }

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

  // check is_archived
  if (!cmd.is_archived) {
    errors.is_archived = ["Is archived is a required field."];
  }

  // check is_active
  if (!cmd.is_active) {
    errors.is_active = ["Is active is a required field."];
  }

  // check is_calculated
  if (!cmd.is_calculated) {
    errors.is_calculated = ["Is calculated is a required field."];
  }

  return errors;
}

export function handleAllowanceUpdateErrors(gatewayError: GatewayError) {
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
    default:
      errors.server = ["Unhandled error genereated by gateway service."];
      return errors;
  }
}
