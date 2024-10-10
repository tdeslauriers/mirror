// regex's that for input validation of profile  type data
const EMAIL_MIN_LENGTH = 6;
const EMAIL_MAX_LENGTH = 254; // RFC 5321
const EMAIL_REGEX: RegExp = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]+$/;

const PASSWORD_MIN_LENGTH = 16;
const PASSWORD_MAX_LENGTH = 64;
const PASSWORD_UPPERCASE_REGEX: RegExp = /[A-Z]/;
const PASSWORD_LOWERCASE_REGEX: RegExp = /[a-z]/;
const PASSWORD_DIGIT_REGEX: RegExp = /\d/;
const PASSWORD_SPECIAL_REGEX: RegExp = /[^A-Za-z0-9]/;
const PASSWORD_KEYBOARD_SEQUENCE_MAX = 4;
const PASSWORD_KEYBOARD_SEQUENCES: string[] = [
  "`1234567890-=",
  `~!@#$\%^&*()_+`,
  "qwertyuiop[]\\",
  "qwertyuiop{}|",
  "asdfghjkl;'",
  'asdfghjkl:"',
  "zxcvbnm,./",
  "zxcvbnm<>?",
  "1qaz2wsx3edc4rfv5tgb6yhn7ujm8ik,9ol.0p;/-['=]",
  '!qaz@wsx#edc$rfv%tgb^yhn&ujm*ik,(ol.)p:?_{"+}',
  "=[;.-pl,0okm9ijn8uhb7ygv6tfc5rdx4esz3wa2q1]",
  `}"?+{:>_pl<)okm(ijn*uhb&ygv^tfc\%rdx$esz#wa@q!`,
  "abcdefghijklmnopqrstuvwxyz",
];

const NAME_MIN_LENGTH = 1;
const NAME_MAX_LENGTH = 32;
const NAME_REGEX: RegExp = /^[a-zA-Z_'-\s]+$/;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type FieldValidation = {
  isValid: boolean;
  messages: string[];
};

// checkEmail checks if an email address is valid
export function checkEmail(email: string) {
  let errors: string[] = [];
  if (
    email.trim().length < EMAIL_MIN_LENGTH ||
    email.trim().length > EMAIL_MAX_LENGTH
  ) {
    errors.push(
      `Email address must be between ${EMAIL_MIN_LENGTH} and ${EMAIL_MAX_LENGTH} characters long.`
    );
  }

  if (!EMAIL_REGEX.test(email)) {
    errors.push("Email address must be valid format, eg., name@domain.com");
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}

export function checkPassword(password: string) {
  let errors: string[] = [];
  if (
    password.trim().length < PASSWORD_MIN_LENGTH ||
    password.trim().length > PASSWORD_MAX_LENGTH
  ) {
    errors.push(
      `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters long.`
    );
  }

  // checks psssword for uppercase, lowercase, digit, special character, and common keyboard sequences
  if (!PASSWORD_UPPERCASE_REGEX.test(password)) {
    errors.push("Password must include at least one uppercase letter.");
  }

  if (!PASSWORD_LOWERCASE_REGEX.test(password)) {
    errors.push("Password must include at least one lowercase letter.");
  }

  if (!PASSWORD_DIGIT_REGEX.test(password)) {
    errors.push("Password must include at least one digit.");
  }

  if (!PASSWORD_SPECIAL_REGEX.test(password)) {
    errors.push("Password must include at least one special character.");
  }

  for (const sequence of PASSWORD_KEYBOARD_SEQUENCES) {
    const substrings = generateSubstrings(
      sequence,
      PASSWORD_KEYBOARD_SEQUENCE_MAX
    );
    const reversedSubstrings = substrings.map((s) =>
      s.split("").reverse().join("")
    );
    const allSubstrings = [...substrings, ...reversedSubstrings];

    if (allSubstrings.some((substring) => password.includes(substring))) {
      errors.push(
        `Password must not include keyboard sequences larger than ${PASSWORD_KEYBOARD_SEQUENCE_MAX} characters long.`
      );
      break;
    }
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}

// helper function to generate all substrings of a string up to a certain length
// for keyboard sequence checking
function generateSubstrings(str: string, maxLength: number) {
  const substrings = [];
  for (let i = 0; i < str.length; i++) {
    for (
      let length = maxLength;
      length <= maxLength && i + length <= str.length;
      length++
    ) {
      const substring = str.substring(i, i + length);
      substrings.push(substring);
      substrings.push(substring.toUpperCase());
    }
  }
  return substrings;
}

// checks if a name (first or last) is valid
export function checkName(name: string) {
  let errors: string[] = [];
  if (
    name.trim().length < NAME_MIN_LENGTH ||
    name.trim().length > NAME_MAX_LENGTH
  ) {
    errors.push(
      `Name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters long.`
    );
  }

  if (!NAME_REGEX.test(name.trim())) {
    errors.push(
      "Name may only contain letters, hyphens, apostrophes, and underscores."
    );
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}

// checks if a birthdate is valid
// server-side only.  Not needed for client-side form
// no need to check for null/undefined values
export function checkBirthdate(year: number, month: number, day: number) {
  let errors: string[] = [];

  // // Check if the values are numbers
  if (!allNumbersValid(year, month, day)) {
    errors.push("Year, month, and day must be numbers.");
  }

  if (year < 1901 || year > 10000) {
    errors.push("Year must be reasonable year.");
  }

  if (month < 1 || month > 12) {
    errors.push("Month must be between 1 and 12.");
  }

  if (day < 1 || day > 31) {
    errors.push("Day must be between 1 and 31.");
  }

  // Create a Date object from the birth date
  const birthDate = new Date(year, month - 1, day);
  // Check if the date is valid
  if (isNaN(birthDate.getTime())) {
    errors.push("Date of birth must be a valid date.");
  }

  // Create Date objects for today and the start date
  const today = new Date();
  const startDate = new Date(1901, 0, 1);

  // Check if the birth date is before today and after the start date
  if (birthDate >= today || birthDate < startDate) {
    errors.push(
      `Date of birth must be between ${
        new Date().getFullYear() - 120
      } and ${new Date().getFullYear()}`
    );
  }

  // check of the birthdate is a real date, eg., 2021-02-31 is not a valid date
  if (
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day
  ) {
    errors.push("Date of birth must be a valid date.");
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}

export function allNumbersValid(...numbers: (number | undefined)[]): boolean {
  return numbers.every((num) => num != undefined && !isNaN(num));
}

// checks if a UUID is valid
export function checkUuid(uuid: string) {
  let errors: string[] = [];
  if (!UUID_REGEX.test(uuid)) {
    errors.push("UUID must be a valid UUID.");
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}
