import {
  checkScope,
  checkServiceName,
  SERVICENAME_MAX_LENGTH,
  SERVICENAME_MIN_LENGTH,
} from "@/validation/scope_fields";
import { checkName, FieldValidation } from "@/validation/user_fields";

export type Scope = {
  scope_id?: string;
  service_name?: string;
  scope?: string;
  name?: string;
  description?: string;
  created_at?: string;
  active?: boolean;
  slug?: string;
};

export type ScopeActionCmd = {
  csrf?: string;
  slug?: string;
  scope: Scope | null;
  errors: { [key: string]: string[] };
};

export function validateScope(scope: Scope) {
  const errors: { [key: string]: string[] } = {};

  // check service name
  if (!scope.service_name || scope.service_name.trim().length === 0) {
    errors.service_name = ["Service name is required."];
  }

  if (scope.service_name && scope.service_name.trim().length > 0) {
    const serviceName: FieldValidation = checkServiceName(scope.service_name);
    if (!serviceName.isValid) {
      errors.service_name = serviceName.messages;
    }
  }

  // check scope
  if (!scope.scope || scope.scope.trim().length === 0) {
    errors.scope = ["Scope is required."];
  }

  if (scope.scope && scope.scope.trim().length > 0) {
    const scopeCheck: FieldValidation = checkScope(scope.scope);
    if (!scopeCheck.isValid) {
      errors.scope = scopeCheck.messages;
    }
  }

  // check scope name
  if (!scope.name || scope.name.trim().length === 0) {
    errors.name = ["Name is required."];
  }

  if (scope.name && scope.name.trim().length > 0) {
    const nameCheck: FieldValidation = checkName(scope.name);
    if (!nameCheck.isValid) {
      errors.name = nameCheck.messages;
    }
  }

  // check description
  if (!scope.description || scope.description.trim().length === 0) {
    errors.description = ["Description is required."];
  }

  if (scope.description && scope.description.trim().length > 0) {
    const descriptionCheck: FieldValidation = checkName(scope.description);
    if (!descriptionCheck.isValid) {
      errors.description = descriptionCheck.messages;
    }
  }

  return errors;
}
