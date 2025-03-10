import {
  checkEmail,
  FieldValidation,
  isRealDob,
} from "@/validation/user_fields";
import { GatewayError } from "../api";

export type AddAllowanceActionCmd = {
  csrf?: string;
  complete: boolean;

  username?: string;
  slug?: string;
  birth_date?: string;

  allowance_account?: string;

  errors: {
    [key: string]: string[];
  };
};

export type AddAllowanceCmd = {
  csrf?: string;

  username?: string;
  slug?: string;
  birth_date?: string;
};

export type AllowanceUser = {
  id?: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  slug?: string;
  created_at?: string;
  birth_date?: string;
  enabled?: boolean;
  account_expired?: boolean;
  account_locked?: boolean;
};

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
