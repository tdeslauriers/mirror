import {
  allNumbersValid,
  checkBirthdate,
  checkEmail,
  checkName,
  checkPassword,
  FieldValidation,
} from "@/validation/user_fields";

export const pageError =
  "Failed to load registration page.  Please try again.  If the problem persists, please contact me.";

export const ErrMsgGeneric =
  "An error occurred processing your registration. Please try again. If the problem persists, please contact me.";

export type RegistrationData = {
  csrf?: string;

  username?: string;
  password?: string;
  confirm_password?: string;
  firstname?: string;
  lastname?: string;
  birthMonth?: number;
  birthDay?: number;
  birthYear?: number;
};

export type RegistrationActionCmd = {
  csrf?: string;
  complete: boolean;
  registration: RegistrationData | null;
  errors: { [key: string]: string[] };
};

// api submission cmd
export type RegistrationCmd = {
  csrf?: string;
  session?: string;

  username?: string;
  password?: string;
  confirm_password?: string;
  firstname?: string;
  lastname?: string;
  birthdate?: string;
};

export function validateRegistration(registration: RegistrationData) {
  const errors: { [key: string]: string[] } = {};

  // check username
  if (!registration.username || registration.username.trim().length === 0) {
    errors.username = ["Email/username address is required."];
  }

  if (registration.username && registration.username.trim().length > 0) {
    const usernameCheck: FieldValidation = checkEmail(registration.username);
    if (!usernameCheck.isValid) {
      errors.username = usernameCheck.messages;
    }
  }

  // check password
  if (!registration.password || registration.password.trim().length === 0) {
    errors.password = ["Password is required."];
  }

  if (registration.password && registration.password.trim().length > 0) {
    const passwordCheck: FieldValidation = checkPassword(registration.password);
    if (!passwordCheck.isValid) {
      errors.password = passwordCheck.messages;
    }
  }

  // check confirm_password: check if matches password
  if (
    !registration.confirm_password ||
    registration.confirm_password.trim().length === 0
  ) {
    errors.confirm_password = ["Confirm password is required."];
  }

  if (
    registration.confirm_password &&
    registration.confirm_password.trim().length > 0
  ) {
    if (registration.password !== registration.confirm_password) {
      errors.confirm_password = ["Passwords do not match."];
    }
  }

  // check firstname
  if (!registration.firstname || registration.firstname.trim().length === 0) {
    errors.firstname = ["First name is required."];
  }

  if (registration.firstname && registration.firstname.trim().length > 0) {
    const firstnameCheck: FieldValidation = checkName(registration.firstname);
    if (!firstnameCheck.isValid) {
      errors.firstname = firstnameCheck.messages;
    }
  }

  // check lastname
  if (!registration.lastname || registration.lastname.trim().length === 0) {
    errors.lastname = ["Last name is required."];
  }

  if (registration.lastname && registration.lastname.trim().length > 0) {
    const lastnameCheck: FieldValidation = checkName(registration.lastname);
    if (!lastnameCheck.isValid) {
      errors.lastname = lastnameCheck.messages;
    }
  }

  // check birthdate
  // check if all birthdate fields are filled out
  if (
    (registration.birthMonth &&
      (!registration.birthDay || !registration.birthYear)) ||
    (registration.birthDay &&
      (!registration.birthMonth || !registration.birthYear)) ||
    (registration.birthYear &&
      (!registration.birthMonth || !registration.birthDay))
  ) {
    errors.birthdate = [
      "Adding a birthdate is optionl, but if you add one, please fill out all dropdowns.",
    ];
    if (!registration.birthMonth) {
      errors.birthMonth.push("Month is required.");
    }
    if (!registration.birthDay) {
      errors.birthDay.push("Day is required.");
    }
    if (!registration.birthYear) {
      errors.birthYear.push("Year is required.");
    }
  }

  // check birthdate fields
  // Note: dob does not always exist, so empty is not an error
  // first need to check if all fields are filled out
  if (
    (registration.birthMonth &&
      !isNaN(registration.birthMonth) &&
      !allNumbersValid(registration.birthDay, registration.birthYear)) ||
    (registration.birthDay &&
      !isNaN(registration.birthDay) &&
      !allNumbersValid(registration.birthMonth, registration.birthYear)) ||
    (registration.birthYear &&
      !isNaN(registration.birthYear) &&
      !allNumbersValid(registration.birthMonth, registration.birthDay))
  ) {
    errors.birthdate = [
      "Date of birth is optional, but if added, please fill out all date fields.",
    ];
    if (!registration.birthMonth) {
      errors.birthdate.push("Month is required.");
    }
    if (!registration.birthDay) {
      errors.birthdate.push("Day is required.");
    }
    if (!registration.birthYear) {
      errors.birthdate.push("Year is required.");
    }
  }

  // only check if all birthdate fields are filled out
  if (
    registration.birthMonth &&
    registration.birthDay &&
    registration.birthYear
  ) {
    // check if birthdate is valid
    const birthdate: FieldValidation = checkBirthdate(
      registration.birthYear,
      registration.birthMonth,
      registration.birthDay
    );
    if (!birthdate.isValid) {
      errors.birthdate = birthdate.messages;
    }
  }

  return errors;
}

export type PasswordEntries = {
  password?: string;
  confirm_password?: string;
};

// validate password entries is needed because the series of regex checks for
// password is too complex for the pattern property of the input element
export function validatePasswords(entry: PasswordEntries) {
  const errors: { [key: string]: string[] } = {};

  // password
  if (entry.password && entry.password.trim().length > 0) {
    const passwordCheck: FieldValidation = checkPassword(entry.password);
    if (!passwordCheck.isValid) {
      errors.password = passwordCheck.messages;
    }
  }

  // confirm_password: check if matches password
  if (entry.confirm_password && entry.confirm_password.trim().length > 0) {
    if (entry.password !== entry.confirm_password) {
      errors.confirm_password = ["Passwords do not match."];
    }
  }

  return errors;
}
