// regex's that for input validation of profile  type data
const EMAIL_MIN_LENGTH = 6;
const EMAIL_MAX_LENGTH = 254; // RFC 5321
const EMAIL_REGEX: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export type FieldValidation = {
  isValid: boolean;
  messages: string[];
};

// checkEmail checks if an email address is valid
export function checkEmail(email: string) {
  let errors: string[] = [];
  if (email.length < EMAIL_MIN_LENGTH || email.length > EMAIL_MAX_LENGTH) {
    errors.push("Email address must be between 6 and 254 characters long.");
  }

  if (!EMAIL_REGEX.test(email)) {
    errors.push("Email address must be valid format, eg., name@domain.com");
  }

  if (errors.length > 0) {
    console.log(errors);
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}

export function checkPassword(password: string) {
  let errors: string[] = [];
  if (
    password.length < PASSWORD_MIN_LENGTH ||
    password.length > PASSWORD_MAX_LENGTH
  ) {
    errors.push(
      `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters long.`
    );
  }

  // checks psssword for uppercase, lowercase, digit, special character, and common keyboard sequences
  if (!PASSWORD_UPPERCASE_REGEX.test(password)) {
    errors.push("Password must contain at least one uppercase letter.");
  }

  if (!PASSWORD_LOWERCASE_REGEX.test(password)) {
    errors.push("Password must contain at least one lowercase letter.");
  }

  if (!PASSWORD_DIGIT_REGEX.test(password)) {
    errors.push("Password must contain at least one digit.");
  }

  if (!PASSWORD_SPECIAL_REGEX.test(password)) {
    errors.push("Password must contain at least one special character.");
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
        "Password must not contain keyboard sequences larger than 4 characters long."
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
  if (name.length < NAME_MIN_LENGTH || name.length > NAME_MAX_LENGTH) {
    errors.push(
      `Name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters long.`
    );
  }

  if (!NAME_REGEX.test(name)) {
    errors.push(
      "Name must only contain letters, hyphens, apostrophes, and/or underscores."
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
export function checkBirthdate(year: string, month: string, day: string) {
  let errors: string[] = [];

  // check if all fields are numbers
  const birthYear = parseInt(year);
  const birthMonth = parseInt(month);
  const birthDay = parseInt(day);

  // Check if the values are numbers
  if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) {
    errors.push("Year, month, and day must be numbers.");
  }

  // Create a Date object from the birth date
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay);

  // Check if the date is valid
  if (isNaN(birthDate.getTime())) {
    errors.push("Birth date must be a valid date.");
  }

  // Create Date objects for today and the start date
  const today = new Date();
  const startDate = new Date(1901, 0, 1);

  // Check if the birth date is before today and after the start date
  if (birthDate >= today || birthDate < startDate) {
    errors.push("Birth date must be before today and after 1901-01-01.");
  }

  if (errors.length > 0) {
    return { isValid: false, message: errors };
  }

  return { isValid: true, message: [] };
}
