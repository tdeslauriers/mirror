import { ServiceClient } from "@/components/forms";
import { checkServiceName } from "@/validation/service_client_field";
import {
  checkName,
  checkUuid,
  FieldValidation,
} from "@/validation/user_fields";

export function validateServiceClient(serviceClient: ServiceClient) {
  let errors: { [key: string]: string[] } = {};

  if (!serviceClient.name || serviceClient.name.trim().length === 0) {
    errors.name = ["Service client name is required."];
  }

  if (serviceClient.name && serviceClient.name.trim().length > 0) {
    const serviceName: FieldValidation = checkServiceName(serviceClient.name);
    if (!serviceName.isValid) {
      errors.name = serviceName.messages;
    }
  }

  if (!serviceClient.owner || serviceClient.owner.trim().length === 0) {
    errors.owner = ["Service client owner is required."];
  }

  if (serviceClient.owner && serviceClient.owner.trim().length > 0) {
    const ownerCheck: FieldValidation = checkName(serviceClient.owner);
    if (!ownerCheck.isValid) {
      errors.owner = ownerCheck.messages;
    }
  }

  // other fields are booleans and don't need validation

  // slug is dropped from the form, so no need to validate it
  // scopes[] is dropped from the form (in another form), so no need to validate it

  return errors;
}

export function validateScopeSlugs(slugs: string[]) {
  const errors: { [key: string]: string[] } = {};

  slugs.forEach((s, i) => {
    if (s.trim().length < 16 || s.trim().length > 64) {
      errors.scopes = [
        `Scope slug index ${i} is not well formed. Must be between 16 and 64 characters.`,
      ];
    }

    const slug = checkUuid(s.trim());
    if (!slug.isValid) {
      errors.scopes = [
        `Scope slug, index ${i}: ${s.substring(0, 9)}xxxxx, is invalid: slug ${
          slug.messages
        }`,
      ];
    }
  });

  return errors;
}

export type ClientScopesCmd = {
  csrf?: string | null;
  client_slug?: string | null;
  scope_slugs: string[];
};
