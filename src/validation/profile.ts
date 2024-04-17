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
const NAME_REGEX: RegExp = /^[a-zA-Z_'-]+$/;

export type FieldValidation = {
  isValid: boolean;
  message: string;
};

// checkEmail checks if an email address is valid
export function checkEmail(email: string) {
  if (email.length < EMAIL_MIN_LENGTH || email.length > EMAIL_MAX_LENGTH) {
    return {
      isValid: false,
      message: "Email must be between 6 and 254 characters long.",
    };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, message: "Invalid email address." };
  }

  return { isValid: true, message: "" };
}

export function checkPassword(password: string) {
  if (
    password.length < PASSWORD_MIN_LENGTH ||
    password.length > PASSWORD_MAX_LENGTH
  ) {
    return {
      isValid: false,
      message: `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters long.`,
    };
  }

  // checks psssword for uppercase, lowercase, digit, special character, and common keyboard sequences
  if (!PASSWORD_UPPERCASE_REGEX.test(password)) {
    return {
      isValid: false,
      message: "Password must contain aat least one uppercase letter.",
    };
  }

  if (!PASSWORD_LOWERCASE_REGEX.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter.",
    };
  }

  if (!PASSWORD_DIGIT_REGEX.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one digit.",
    };
  }

  if (!PASSWORD_SPECIAL_REGEX.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one special character.",
    };
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
    if (
      allSubstrings.some((substring) => {
        const includes = password.includes(substring);
        if (includes) {
          console.log(`Password contains sequence: ${substring}`);
        }
        return includes;
      })
    ) {
      return {
        isValid: false,
        message:
          "Password must not contain keyboard sequences larger than 4 characters long.",
      };
    }
  }

  return { isValid: true, message: "" };
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
      substrings.push(str.substring(i, i + length));
    }
  }
  return substrings;
}

// checks if a name (first or last) is valid
export function checkName(name: string) {
  if (name.length < NAME_MIN_LENGTH || name.length > NAME_MAX_LENGTH) {
    return {
      isValid: false,
      message: `Name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters long.`,
    };
  }

  if (!NAME_REGEX.test(name)) {
    return {
      isValid: false,
      message:
        "Name must only contain letters, hyphens, apostrophes, and/or underscores.",
    };
  }

  return { isValid: true, message: "" };
}

// checks if a birthdate is valid
export function checkBirthdate(year: string, month: string, day: string) {
  // jump out if all fields are empty
  if (!year && !month && !day) {
    return { isValid: true, message: "" };
  }

  // check if all fields are numbers
  const birthYear = parseInt(year);
  const birthMonth = parseInt(month);
  const birthDay = parseInt(day);

  // Check if the values are numbers
  if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) {
    return { isValid: false, message: "Year, month, and day must be numbers." };
  }

  // Create a Date object from the birth date
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay);

  // Check if the date is valid
  if (isNaN(birthDate.getTime())) {
    return { isValid: false, message: "Invalid birth date." };
  }

  // Create Date objects for today and the start date
  const today = new Date();
  const startDate = new Date(1901, 0, 1);

  // Check if the birth date is before today and after the start date
  if (birthDate >= today || birthDate < startDate) {
    return {
      isValid: false,
      message: "Birth date must be before today and after 1901-01-01.",
    };
  }

  return { isValid: true, message: "" };
}
