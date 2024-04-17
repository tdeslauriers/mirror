"use server";

import {
  FieldValidation,
  checkBirthdate,
  checkEmail,
  checkName,
  checkPassword,
} from "@/validation/profile";

interface Registration {
  username: string;
  password: string;
  confirm_password: string;
  firstname: string;
  lastname: string;
  birthdate?: string;
}

export async function handleRegister(prevFormData: any, formData: FormData) {
  // validate the form data
  // accumulate all errors and return them at once
  const errors: { [key: string]: string } = {};

  // username
  const user: string = formData.get("username") as string;
  const usernameCheck: FieldValidation = checkEmail(user);
  if (!usernameCheck.isValid) {
    errors.username = usernameCheck.message;
  }

  // password
  const pw: string = formData.get("password") as string;
  const passwordCheck: FieldValidation = checkPassword(pw);
  if (!passwordCheck.isValid) {
    errors.password = passwordCheck.message;
  }

  // confirm_password: check if matches password
  const confirm: string = formData.get("confirm_password") as string;
  if (pw !== confirm) {
    errors.confirm_password = "Passwords do not match.";
  }

  // check firstname
  const first: string = formData.get("firstname") as string;
  const firstnameCheck: FieldValidation = checkName(first);
  if (!firstnameCheck.isValid) {
    errors.firstname = firstnameCheck.message;
  }

  // check lastname
  const last: string = formData.get("lastname") as string;
  const lastnameCheck: FieldValidation = checkName(last);
  if (!lastnameCheck.isValid) {
    errors.lastname = lastnameCheck.message;
  }

  // check birthdate if exists
  const birthYear = formData.get("birthYear") as string;
  const birthMonth = formData.get("birthMonth") as string;
  const birthDay = formData.get("birthDay") as string;

  if (
    (birthMonth && (!birthYear || !birthDay)) ||
    (birthDay && (!birthYear || !birthMonth)) ||
    (birthYear && (!birthMonth || !birthDay))
  ) {
    errors.dobIncomplete =
      "If entering a birthdate, all fields are required, otherwise leave all blank.";
  }

  const birthdateCheck: FieldValidation = checkBirthdate(
    birthYear,
    birthMonth,
    birthDay
  );

  if (!birthdateCheck.isValid) {
    errors.dobInvalid = birthdateCheck.message;
  }

  // if there are any errors, return them
  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // field errors for dob are returned above, needs to be set to value or undefined
  const bday: string | undefined =
    birthYear && birthMonth && birthDay && birthdateCheck.isValid
      ? `${birthYear}-${birthMonth}-${birthDay}`
      : undefined;

  // create the registration object
  const registration: Registration = {
    username: user,
    password: pw,
    confirm_password: confirm,
    firstname: first,
    lastname: last,
    birthdate: bday,
  };
}
