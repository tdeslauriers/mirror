export const SERVICENAME_MIN_LENGTH = 2;
export const SERVICENAME_MAX_LENGTH = 32;
const SERVICENAME_REGEX: RegExp = /^[a-z]+$/; // service names can only be lowercase letters

export const SCOPE_MIN_LENGTH = 7; // r:ran:*
export const SCOPE_MAX_LENGTH = 64;
const SCOPE_REGEX: RegExp = /^[a-z\:\*]+$/;

export const SCOPE_NAME_MIN_LENGTH = 2;
export const SCOPE_NAME_MAX_LENGTH = 64;
const SCOPE_NAME_REGEX: RegExp = /^[a-zA-Z0-9\s]+$/;

export const SCOPE_DESCRIPTION_MIN_LENGTH = 2;
export const SCOPE_DESCRIPTION_MAX_LENGTH = 254;

export function checkServiceName(service_name: string) {
  let errors: string[] = [];
  if (
    service_name.trim().length < SERVICENAME_MIN_LENGTH ||
    service_name.trim().length > SERVICENAME_MAX_LENGTH
  ) {
    errors.push(
      `Service name must be between ${SERVICENAME_MIN_LENGTH} and ${SERVICENAME_MAX_LENGTH} characters long.`
    );
  }

  if (!SERVICENAME_REGEX.test(service_name)) {
    errors.push("Service name must be lowercase letters only.");
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}

export function checkScope(scope: string) {
  let errors: string[] = [];
  if (
    scope.trim().length < SCOPE_MIN_LENGTH ||
    scope.trim().length > SCOPE_MAX_LENGTH
  ) {
    errors.push(
      `Scope must be between ${SCOPE_MIN_LENGTH} and ${SCOPE_MAX_LENGTH} characters long.`
    );
  }

  if (!SCOPE_REGEX.test(scope)) {
    errors.push("Scope must be in the format: r:ran:*");
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}

export function checkScopeName(name: string) {
  let errors: string[] = [];
  if (
    name.trim().length < SCOPE_NAME_MIN_LENGTH ||
    name.trim().length > SCOPE_NAME_MAX_LENGTH
  ) {
    errors.push(
      `Scope name must be between ${SCOPE_NAME_MIN_LENGTH} and ${SCOPE_NAME_MAX_LENGTH} characters long.`
    );
  }

  if (!SCOPE_NAME_REGEX.test(name)) {
    errors.push("Scope name must be alphanumeric characters only.");
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}

export function checkScopeDescription(description: string) {
  let errors: string[] = [];
  if (
    description.trim().length < SCOPE_DESCRIPTION_MIN_LENGTH ||
    description.trim().length > SCOPE_DESCRIPTION_MAX_LENGTH
  ) {
    errors.push(
      `Scope description must be between ${SCOPE_DESCRIPTION_MIN_LENGTH} and ${SCOPE_DESCRIPTION_MAX_LENGTH} characters long.`
    );
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}
