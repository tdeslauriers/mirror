import { ServiceClient } from "@/components/forms";

export const SERVICENAME_MIN_LENGTH = 2;
export const SERVICENAME_MAX_LENGTH = 32;
export const SERVICENAME_REGEX: RegExp = /^[a-z]+$/; // service names can only be lowercase letters

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

