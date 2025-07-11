import {
  checkPermission,
  checkPermissionDescription,
  checkPermissionName,
} from "@/validation/permission-fields";
import { checkServiceName } from "@/validation/service_client_field";
import { FieldValidation } from "@/validation/user_fields";

export type PermissionActionCmd = {
  csrf?: string | null;
  slug?: string | null;
  service?: string | null;
  permission?: Permission | null;
  errors: { [key: string]: string[] };
};

const allowedServices = new Set(["pixie", "apprentice"]);

export type Permission = {
  csrf?: string;
  uuid?: string;
  service_name?: string;
  permission?: string;
  name?: string;
  description?: string;
  created_at?: string;
  active?: boolean;
  slug?: string;
};

// not all services have fine-grained permissions, so check if the service is allowed
const allowedServiceNames = new Set(["pixie", "apprentice"]);

export function isAllowedService(serviceName: string): boolean {
  if (!serviceName || serviceName.trim().length === 0) {
    return false;
  }
  return allowedServiceNames.has(serviceName.toLowerCase());
}

export function validatePermission(permission: Permission) {
  const errors: { [key: string]: string[] } = {};

  // check csrf
  if (
    permission.csrf &&
    permission.csrf.trim().length === 16 &&
    permission.csrf.trim().length > 64
  ) {
    errors.csrf = [
      "CSRF token is not well formed.  Cannot edit or tamper with this value.",
    ];
  }

  // validate service name
  if (!permission.service_name || permission.service_name.trim().length === 0) {
    errors.service_name = ["Service name is required."];
  }

  if (permission.service_name && permission.service_name.trim().length > 0) {
    const serviceName: FieldValidation = checkServiceName(
      permission.service_name
    );
    if (!serviceName.isValid) {
      errors.service_name = serviceName.messages;
    }
  }

  // check if service is allowed
  if (
    permission.service_name &&
    !allowedServices.has(permission.service_name.toLowerCase())
  ) {
    errors.service_name = [
      `Service "${
        permission.service_name
      }" is not allowed. Allowed services are: ${Array.from(
        allowedServices
      ).join(", ")}`,
    ];
  }

  // check permission
  if (!permission.permission || permission.permission.trim().length === 0) {
    errors.permission = ["Permission is required."];
  }

  if (permission.permission && permission.permission.trim().length > 0) {
    const permissionCheck: FieldValidation = checkPermission(
      permission.permission
    );
    if (!permissionCheck.isValid) {
      errors.permission = permissionCheck.messages;
    }
  }

  // check permission name
  if (!permission.name || permission.name.trim().length === 0) {
    errors.name = ["Name is required."];
  }

  if (permission.name && permission.name.trim().length > 0) {
    const nameCheck: FieldValidation = checkPermissionName(permission.name);
    if (!nameCheck.isValid) {
      errors.name = nameCheck.messages;
    }
  }

  // check description
  if (!permission.description || permission.description.trim().length === 0) {
    errors.description = ["Description is required."];
  }

  if (permission.description && permission.description.trim().length > 0) {
    const descriptionCheck: FieldValidation = checkPermissionDescription(
      permission.description
    );
    if (!descriptionCheck.isValid) {
      errors.description = descriptionCheck.messages;
    }
  }

  return errors;
}
