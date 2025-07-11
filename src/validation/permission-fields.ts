export const PERMISSION_MIN_LENGTH = 2;
export const PERMISSION_MAX_LENGTH = 64;
const PERMISSION_REGEX: RegExp = /^[A-Z0-9_]+$/;

export const PERMISSION_NAME_MIN_LENGTH = 2;
export const PERMISSION_NAME_MAX_LENGTH = 64;
const PERMISSION_NAME_REGEX: RegExp = /^[a-zA-Z0-9 ]+$/;

export const PERMISSION_DESCRIPTION_MIN_LENGTH = 2;
export const PERMISSION_DESCRIPTION_MAX_LENGTH = 254;

export function checkPermission(permission: string) {
  let errors: string[] = [];

  if (
    permission.trim().length < PERMISSION_MIN_LENGTH ||
    permission.trim().length > PERMISSION_MAX_LENGTH
  ) {
    errors.push(
      `Permission must be between ${PERMISSION_MIN_LENGTH} and ${PERMISSION_MAX_LENGTH} characters long, and a single word.`
    );
  }

  if (!PERMISSION_REGEX.test(permission)) {
    errors.push("Permission must be capitalized alphanumeric characters only");
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}

export function checkPermissionName(name: string) {
  let errors: string[] = [];

  if (
    name.trim().length < PERMISSION_NAME_MIN_LENGTH ||
    name.trim().length > PERMISSION_NAME_MAX_LENGTH
  ) {
    errors.push(
      `Permission name must be between ${PERMISSION_NAME_MIN_LENGTH} and ${PERMISSION_NAME_MAX_LENGTH} characters long, and a single word.`
    );
  }

  if (!PERMISSION_NAME_REGEX.test(name)) {
    errors.push("Permission name must be alphanumeric characters only");
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}

export function checkPermissionDescription(description: string) {
  let errors: string[] = [];
  if (
    description.trim().length < PERMISSION_DESCRIPTION_MIN_LENGTH ||
    description.trim().length > PERMISSION_DESCRIPTION_MAX_LENGTH
  ) {
    errors.push(
      `Permission description must be between ${PERMISSION_DESCRIPTION_MIN_LENGTH} and ${PERMISSION_DESCRIPTION_MAX_LENGTH} characters long.`
    );
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}
