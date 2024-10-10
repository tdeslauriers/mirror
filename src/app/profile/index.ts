import {
  allNumbersValid,
  checkBirthdate,
  checkName,
  FieldValidation,
} from "@/validation/fields";

export type Profile = {
  id?: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  slug?: string;
  created_at?: string;
  enabled?: boolean;
  account_expired?: boolean;
  account_locked?: boolean;
  birthMonth?: number;
  birthDay?: number;
  birthYear?: number;
};

export type ProfileActionCmd = {
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
    (profile.birthMonth &&
      !isNaN(profile.birthMonth) &&
      !allNumbersValid(profile.birthDay, profile.birthYear)) ||
    (profile.birthDay &&
      !isNaN(profile.birthDay) &&
      !allNumbersValid(profile.birthMonth, profile.birthYear)) ||
    (profile.birthYear &&
      !isNaN(profile.birthYear) &&
      !allNumbersValid(profile.birthMonth, profile.birthDay))
  ) {
    errors.birthdate = [
      "Date of birth is optional, but if added, please fill out all date fields.",
    ];
    if (!profile.birthMonth) {
      errors.birthdate.push("Month is required.");
    }
    if (!profile.birthDay) {
      errors.birthdate.push("Day is required.");
    }
    if (!profile.birthYear) {
      errors.birthdate.push("Year is required.");
    }
  }

  // only check if all birthdate fields are filled out
  if (profile.birthMonth && profile.birthDay && profile.birthYear) {
    // check if birthdate is valid
    const birthdate: FieldValidation = checkBirthdate(
      profile.birthYear,
      profile.birthMonth,
      profile.birthDay
    );
    if (!birthdate.isValid) {
      errors.birthdate = birthdate.messages;
    }
  }

  return errors;
}
