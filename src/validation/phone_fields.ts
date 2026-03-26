export const COUNTRY_CODE_REGEX = /^\+?[1-9]\d{0,2}$/; // E.164 country code format (1-3 digits, optional leading +)
export const PHONE_NUMBER_REGEX = /^\+?[1-9]\d{1,14}$/; // E.164 format
export const EXTENSION_REGEX = /^\d{1,10}$/; // 1-10 digits

// validate country code
export function checkCountryCode(countryCode: string) {
  let errors: string[] = [];

  if (!COUNTRY_CODE_REGEX.test(countryCode)) {
    errors.push(
      "Country code must be 1-3 digits, and can optionally start with a plus sign.",
    );
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}

// validate phone number
export function checkPhoneNumber(phoneNumber: string) {
  let errors: string[] = [];

  if (!PHONE_NUMBER_REGEX.test(phoneNumber)) {
    errors.push(
      "Phone number must be in valid E.164 format (1-15 digits, can optionally start with a plus sign).",
    );
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}

// validate extension
export function checkExtension(extension: string) {
  let errors: string[] = [];

  if (!EXTENSION_REGEX.test(extension)) {
    errors.push("Extension must be 1-10 digits.");
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}
