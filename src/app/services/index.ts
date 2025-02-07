import { ServiceClient } from "@/components/forms";
import { checkServiceName } from "@/validation/service_client_field";
import { checkName, FieldValidation } from "@/validation/user_fields";

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
