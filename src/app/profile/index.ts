import {
  allNumbersValid,
  checkBirthdate,
  checkName,
  checkPassword,
  FieldValidation,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/validation/user_fields";
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


