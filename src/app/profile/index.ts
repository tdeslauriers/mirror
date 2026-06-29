import {
  ErrNewConfirmPwMismatch,
  ErrPasswordInvalid,
  ErrPasswordInvalidContains,
  ErrPasswordUsedPreviously,
  ResetData,
} from "@/components/forms";
import {
  allNumbersValid,
  checkBirthdate,
  checkName,
  FieldValidation,
} from "@/validation/user_fields";
import { ErrMsgGeneric, GatewayError } from "../api";
import { Address, Phone } from "../users";

export type Profile = {
  csrf?: string;

  id?: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  nickname?: string;
  dark_mode?: boolean;
  slug?: string;
  created_at?: string;
  enabled?: boolean;
  account_expired?: boolean;
  account_locked?: boolean;
  birth_month?: number;
  birth_day?: number;
  birth_year?: number;
  addresses?: Address[] | null;
  phones?: Phone[] | null;
};

export type ProfileActionCmd = {
  csrf?: string | null;
  slug?: string;
  username?: string;
  profile: Profile | null;
  errors: { [key: string]: string[] };
};

export function validateUpdateProfile(profile: Profile) {
  const errors: { [key: string]: string[] } = {};

  // check firstname
  if (!profile.firstname || profile.firstname.trim().length === 0) {
    console.log("firstname is required");
    errors.firstname = ["Firstname is required."];
  }

  if (profile.firstname && profile.firstname.trim().length > 0) {
    const firstnameCheck: FieldValidation = checkName(profile.firstname);
    if (!firstnameCheck.isValid) {
      errors.firstname = firstnameCheck.messages;
    }
  }

  // check lastname
  if (!profile.lastname || profile.lastname.trim().length === 0) {
    errors.lastname = ["Lastname is required."];
  }

  if (profile.lastname && profile.lastname.trim().length > 0) {
    const lastnameCheck: FieldValidation = checkName(profile.lastname);
    if (!lastnameCheck.isValid) {
      errors.lastname = lastnameCheck.messages;
    }
  }

  // check nickname
  if (profile.nickname && profile.nickname.trim().length > 0) {
    const nicknameCheck: FieldValidation = checkName(profile.nickname);
    if (!nicknameCheck.isValid) {
      errors.nickname = nicknameCheck.messages;
    }
  }

  // check birthdate fields
  // Note: dob does not always exist, so empty is not an error
  // first need to check if all fields are filled out
  if (
    (profile.birth_month &&
      !isNaN(profile.birth_month) &&
      !allNumbersValid(profile.birth_day, profile.birth_year)) ||
    (profile.birth_day &&
      !isNaN(profile.birth_day) &&
      !allNumbersValid(profile.birth_month, profile.birth_year)) ||
    (profile.birth_year &&
      !isNaN(profile.birth_year) &&
      !allNumbersValid(profile.birth_month, profile.birth_day))
  ) {
    errors.birthdate = [
      "Date of birth is optional, but if added, please fill out all date fields.",
    ];
    if (!profile.birth_month) {
      errors.birthdate.push("Month is required.");
    }
    if (!profile.birth_day) {
      errors.birthdate.push("Day is required.");
    }
    if (!profile.birth_year) {
      errors.birthdate.push("Year is required.");
    }
  }

  // only check if all birthdate fields are filled out
  if (profile.birth_month && profile.birth_day && profile.birth_year) {
    // check if birthdate is valid
    const birthdate: FieldValidation = checkBirthdate(
      profile.birth_year,
      profile.birth_month,
      profile.birth_day,
    );
    if (!birthdate.isValid) {
      errors.birthdate = birthdate.messages;
    }
  }

  return errors;
}

export function validateResetPasswords(reset: ResetData) {
  const errors: { [key: string]: string[] } = {};

  // check current password
  if (!reset.current_password || reset.current_password.trim().length === 0) {
    errors.current_password = ["Current password is required."];
  }

  // check new password
  if (!reset.new_password || reset.new_password.trim().length === 0) {
    errors.new_password = ["New password is required."];
  }

  // check confirm password
  if (!reset.confirm_password || reset.confirm_password.trim().length === 0) {
    errors.confirm_password = ["Confirm password is required."];
  }

  // check if new and confirm passwords match
  if (
    reset.new_password &&
    reset.confirm_password &&
    reset.new_password !== reset.confirm_password
  ) {
    errors.confirm_password = [
      "New password and confirm password do not match.",
    ];
  }

  return errors;
}

export function handleProfileErrors(gatewayError: GatewayError) {
  const errors: { [key: string]: string[] } = {};

  switch (gatewayError.code) {
    case 400:
      errors.server = [gatewayError.message];
      return errors;
    case 401:
      errors.server = [gatewayError.message];
    case 403:
      errors.server = [gatewayError.message];
    case 404:
      errors.server = [gatewayError.message];
    case 405:
      errors.server = [gatewayError.message];
      return errors;
    case 422:
      // temporary fix for now: determine which error received
      switch (true) {
        case gatewayError.message.includes("firstname"):
          errors.firstname = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("lastname"):
          errors.lastname = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("birthdate"):
          errors.birthdate = [gatewayError.message];
          return errors;
        case gatewayError.message.includes(ErrPasswordUsedPreviously):
          errors.confirm_password = [gatewayError.message];
          return errors;
        case gatewayError.message.includes(ErrNewConfirmPwMismatch):
          errors.confirm_password = [gatewayError.message];
          return errors;
        case gatewayError.message.includes(ErrPasswordInvalid):
          errors.confirm_password = [gatewayError.message];
          return errors;
        case gatewayError.message.includes(ErrPasswordInvalidContains):
          errors.confirm_password = [gatewayError.message];
          return errors;
        default:
          break;
      }
    default:
      errors.server = [gatewayError.message || ErrMsgGeneric];
      return errors;
  }
}
