import {
  allNumbersValid,
  checkBirthdate,
  checkName,
  checkPassword,
  FieldValidation,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/validation/fields";
import { error } from "console";

export type Profile = {
  csrf?: string;

  id?: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  slug?: string;
  created_at?: string;
  enabled?: boolean;
  account_expired?: boolean;
  account_locked?: boolean;
  birth_month?: number;
  birth_day?: number;
  birth_year?: number;
};

export type ProfileActionCmd = {
  csrf?: string;
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
      profile.birth_day
    );
    if (!birthdate.isValid) {
      errors.birthdate = birthdate.messages;
    }
  }

  return errors;
}

// username will come from the access token downstream
export type ResetData = {
  csrf?: string;

  current_password?: string;
  new_password?: string;
  confirm_password?: string;
};

export type ResetPwActionCmd = {
  csrf?: string;
  reset: ResetData | null;
  errors: { [key: string]: string[] };
};

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
