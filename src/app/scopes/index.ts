import { Scope } from "@/components/forms";
import {
  checkScope,
  checkScopeDescription,
  checkScopeName,
} from "@/validation/scope_fields";
import { checkServiceName } from "@/validation/service_client_field";
import { FieldValidation } from "@/validation/user_fields";

export function validateScope(scope: Scope) {
  const errors: { [key: string]: string[] } = {};

  // check csrf
  if (
    scope.csrf &&
    scope.csrf.trim().length === 16 &&
    scope.csrf.trim().length > 64
  ) {
    errors.csrf = [
      "CSRF token is not well formed.  My cannot edit or tamper with this value.",
    ];
  }

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
    const nameCheck: FieldValidation = checkScopeName(scope.name);
    if (!nameCheck.isValid) {
      errors.name = nameCheck.messages;
    }
  }

  // check description
  if (!scope.description || scope.description.trim().length === 0) {
    errors.description = ["Description is required."];
  }

  if (scope.description && scope.description.trim().length > 0) {
    const descriptionCheck: FieldValidation = checkScopeDescription(
      scope.description
    );
    if (!descriptionCheck.isValid) {
      errors.description = descriptionCheck.messages;
    }
  }

  return errors;
}
