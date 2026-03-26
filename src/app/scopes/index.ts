import {
  checkScope,
  checkScopeDescription,
  checkScopeName,
} from "@/validation/scope_fields";
import { checkServiceName } from "@/validation/service_client_field";
import { FieldValidation } from "@/validation/user_fields";

const allowedServices = new Set([
  "apprentice",
  "erebor",
  "pixie",
  "ran",
  "shaw",
  "silhouette",
]);

export type Scope = {
  csrf?: string;

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
  csrf?: string | null;
  slug?: string | null;
  scope?: Scope | null;
  errors: { [key: string]: string[] };
};

export function validateScope(scope: Scope) {
  const errors: { [key: string]: string[] } = {};

  // check csrf
  if (
    scope.csrf &&
    scope.csrf.trim().length === 16 &&
    scope.csrf.trim().length > 64
  ) {
    errors.csrf = [
      "CSRF token is not well formed.  Cannot edit or tamper with this value.",
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

  // check if service is allowed
  if (
    scope.service_name &&
    !allowedServices.has(scope.service_name.toLowerCase())
  ) {
    errors.service_name = [
      `Service "${
        scope.service_name
      }" is not allowed. Allowed services are: ${Array.from(
        allowedServices,
      ).join(", ")}`,
    ];
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
      scope.description,
    );
    if (!descriptionCheck.isValid) {
      errors.description = descriptionCheck.messages;
    }
  }

  return errors;
}

// scopes comparator for sorting by name in ascending order
export function compareScopesByNameAsc(a: Scope, b: Scope) {
  const nameA = (a.name ?? "").trim();
  const nameB = (b.name ?? "").trim();

  // rows with missing names go to the bottom
  if (!nameA && !nameB) {
    return (a.slug ?? "").localeCompare(b.slug ?? "", undefined, {
      sensitivity: "base",
    });
  }
  if (!nameA) return 1;
  if (!nameB) return -1;

  const byName = nameA.localeCompare(nameB, undefined, {
    sensitivity: "base",
  });

  if (byName !== 0) return byName;

  return (a.scope ?? "").localeCompare(b.scope ?? "", undefined, {
    sensitivity: "base",
  });
}
