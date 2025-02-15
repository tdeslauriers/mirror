import {
  checkPassword,
  FieldValidation,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/validation/user_fields";

export type Scope = {
  csrf?: string;

  scope_id?: string;
  service_name?: string;
  scope?: string;
  name?: string;
  description?: string;
  created_at?: string;
  active?: boolean;
  slug?: string;
};

export type ScopeActionCmd = {
  csrf?: string;
  slug?: string | null;
  scope?: Scope | null;
  errors: { [key: string]: string[] };
};

export type ServiceClient = {
  csrf?: string;

  id?: string;
  name?: string;
  owner?: string;
  created_at?: string;
  enabled?: boolean;
  account_expired?: boolean;
  account_locked?: boolean;
  slug?: string;
  scopes?: Scope[];
};

export type ServiceClientActionCmd = {
  csrf?: string;
  slug?: string | null;
  serviceClient?: ServiceClient | null;
  errors: { [key: string]: string[] };
};

// username will come from the access token downstream
export type ResetData = {
  csrf?: string;
  resource_id?: string; // used for service pw resets, users will be undefined.

  current_password?: string;
  new_password?: string;
  confirm_password?: string;
};

export type ResetPwActionCmd = {
  csrf?: string;
  resource_id?: string; // used for service pw resets, users will be undefined.
  reset: ResetData | null;
  errors: { [key: string]: string[] };
};

export const ErrPasswordInvalid = "password must include";
export const ErrPasswordInvalidContains = "password contains";
export const ErrPasswordUsedPreviously = "password has been used previously";
export const ErrNewConfirmPwMismatch =
  "new password and confirmation password do not match";

export function validatePasswords(reset: ResetData) {
  const errors: { [key: string]: string[] } = {};

  // check current password
  // light-weight validation, just check for length, etc.,
  if (!reset.current_password || reset.current_password.trim().length === 0) {
    errors.current_passord = ["Current passord is required."];
  }

  // check length of current password
  if (
    reset.current_password &&
    (reset.current_password.length < PASSWORD_MIN_LENGTH ||
      reset.current_password.length > PASSWORD_MAX_LENGTH)
  ) {
    errors.current_password = [
      `Current password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`,
    ];
  }

  // new password => full input validation checks similar to registration
  if (!reset.new_password || reset.new_password.trim().length === 0) {
    errors.new_password = ["New password is required."];
  }

  if (
    reset.new_password &&
    (reset.new_password.trim().length < PASSWORD_MIN_LENGTH ||
      reset.new_password.trim().length > PASSWORD_MAX_LENGTH)
  ) {
    errors.new_password = [
      `New password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`,
    ];
  }

  if (reset.new_password) {
    const passwordCheck: FieldValidation = checkPassword(reset.new_password);
    if (!passwordCheck.isValid) {
      errors.password = passwordCheck.messages;
    }
  }

  // confirm_password: check if matches password
  if (!reset.confirm_password || reset.confirm_password.trim().length === 0) {
    errors.confirm_password = ["Confirm password is required."];
  }

  if (
    reset.confirm_password &&
    (reset.confirm_password.trim().length < PASSWORD_MIN_LENGTH ||
      reset.confirm_password.trim().length > PASSWORD_MAX_LENGTH)
  ) {
    errors.confirm_password = [
      `Confirm password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`,
    ];
  }

  if (reset.new_password !== reset.confirm_password) {
    console.log("New password and confirmation password do not match.");
    errors.confirm_password = [
      "New password and confirmation password do not match.",
    ];
  }

  return errors;
}

export type EntityScopesActionCmd = {
  csrf?: string | null;
  slug?: string | null;
  errors: { [key: string]: string[] };
};
