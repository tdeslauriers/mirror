import {
  ErrNewConfirmPwMismatch,
  ErrPasswordInvalid,
  ErrPasswordInvalidContains,
  ErrPasswordUsedPreviously,
} from "@/components/forms";
import { checkServiceName } from "@/validation/service_client_field";
import {
  checkName,
  checkPassword,
  checkUuid,
  FieldValidation,
} from "@/validation/user_fields";
import { GatewayError } from "../api";
import { Scope } from "../scopes";

export type ServiceClient = {
  csrf?: string;

  id?: string;
  name?: string;
  owner?: string;
  created_at?: string;
  enabled?: boolean;
  account_expired?: boolean;
  account_locked?: boolean;
  slug?: string;
  scopes?: Scope[];
};

// validate service client fields before sending to gateway
export function validateServiceClient(serviceClient: ServiceClient) {
  let errors: { [key: string]: string[] } = {};

  // check name
  if (!serviceClient.name || serviceClient.name.trim().length === 0) {
    errors.name = ["Service client name is required."];
  }

  if (serviceClient.name && serviceClient.name.trim().length > 0) {
    const name: FieldValidation = checkServiceName(serviceClient.name);
    if (!name.isValid) {
      errors.name = name.messages;
    }
  }

  // check owner
  if (!serviceClient.owner || serviceClient.owner.trim().length === 0) {
    errors.owner = ["Service client owner is required."];
  }

  if (serviceClient.owner && serviceClient.owner.trim().length > 0) {
    const owner: FieldValidation = checkName(serviceClient.owner);
    if (!owner.isValid) {
      errors.owner = owner.messages;
    }
  }

  // other fields are booleans and don't need validation

  // slug is dropped from the form, so no need to validate it
  // scopes[] is dropped from the form (in another form), so no need to validate it

  return errors;
}

// validate scope slugs before sending to gateway
export function validateScopeSlugs(slugs: string[]) {
  const errors: { [key: string]: string[] } = {};

  slugs.forEach((s, i) => {
    if (s.trim().length < 16 || s.trim().length > 64) {
      errors.server = [
        `Scope slug index ${i} is not well formed. Must be between 16 and 64 characters.`,
      ];
    }

    const slug = checkUuid(s.trim());
    if (!slug.isValid) {
      errors.server = [
        `Scope slug, index ${i}: ${s.substring(0, 9)}xxxxx, is invalid: slug ${
          slug.messages
        }`,
      ];
    }
  });

  return errors;
}

// command for registering a new service client
export type ClientScopesCmd = {
  csrf?: string | null;
  client_slug?: string | null;
  scope_slugs: string[];
};

export type RegisterClient = {
  csrf?: string;

  id?: string;
  name?: string;
  owner?: string;
  password?: string;
  confirm_password?: string;
  slug?: string;
  enabled?: boolean;
};

// validate the command before sending to the gateway service
export function validateClientRegister(cmd: RegisterClient) {
  let errors: { [key: string]: string[] } = {};

  // check csrf
  if (
    cmd.csrf &&
    cmd.csrf.trim().length === 16 &&
    cmd.csrf.trim().length > 64
  ) {
    errors.csrf = [
      "CSRF token is not well formed.  My cannot edit or tamper with this value.",
    ];
  }

  if (cmd.csrf && cmd.csrf.trim().length > 0) {
    const csrf = checkUuid(cmd.csrf.trim());
    if (!csrf.isValid) {
      errors.server = ["CSRF token is not well formed: ", ...csrf.messages];
    }
  }

  // check name
  if (!cmd.name || cmd.name.trim().length === 0) {
    errors.name = ["Service client name is required."];
  }

  if (cmd.name && cmd.name.trim().length > 0) {
    const name: FieldValidation = checkServiceName(cmd.name);
    if (!name.isValid) {
      errors.name = name.messages;
    }
  }

  // check owner
  if (!cmd.owner || cmd.owner.trim().length === 0) {
    errors.owner = ["Service client owner is required."];
  }

  if (cmd.owner && cmd.owner.trim().length > 0) {
    const owner: FieldValidation = checkName(cmd.owner);
    if (!owner.isValid) {
      errors.owner = owner.messages;
    }
  }

  // check password
  if (!cmd.password || cmd.password.trim().length === 0) {
    errors.password = ["Password is required."];
  }

  if (cmd.password && cmd.password.trim().length > 0) {
    const passwordCheck: FieldValidation = checkPassword(cmd.password);
    if (!passwordCheck.isValid) {
      errors.password = passwordCheck.messages;
    }
  }

  // check confirm_password: check if matches password
  if (!cmd.confirm_password || cmd.confirm_password.trim().length === 0) {
    errors.confirm_password = ["Confirm password is required."];
  }

  if (cmd.confirm_password && cmd.confirm_password.trim().length > 0) {
    if (cmd.password !== cmd.confirm_password) {
      errors.confirm_password = ["Passwords do not match."];
    }
  }

  return errors;
}

// command for generating PAT for service client
export type PatActionCmd = {
  csrf?: string | null;
  slug?: string | null;
  success?: boolean;
  pat?: string | null;
  errors?: { [key: string]: string[] };
};

// gateway/service command for generating PAT for service client
export type GeneratePatCmd = {
  csrf?: string | null;
  slug?: string | null;
};

// validate the command before sending to the gateway service
export function validateGeneratePatCmd(cmd: GeneratePatCmd) {
  let errors: { [key: string]: string[] } = {};

  // check csrf
  if (
    cmd.csrf &&
    (cmd.csrf.trim().length < 16 || cmd.csrf.trim().length > 64)
  ) {
    errors.csrf = [
      "CSRF token is not well formed.  My cannot edit or tamper with this value.",
    ];
  }

  if (cmd.csrf && cmd.csrf.trim().length > 0) {
    const csrf = checkUuid(cmd.csrf.trim());
    if (!csrf.isValid) {
      errors.server = ["CSRF token is not well formed: ", ...csrf.messages];
    }
  }

  // check slug
  if (
    cmd.slug &&
    (cmd.slug.trim().length < 16 || cmd.slug.trim().length > 64)
  ) {
    errors.slug = [
      "Service client slug is not well formed.  My cannot edit or tamper with this value.",
    ];
  }

  if (cmd.slug && cmd.slug.trim().length > 0) {
    const slug = checkUuid(cmd.slug.trim());
    if (!slug.isValid) {
      errors.server = [
        "Service client slug is not well formed: ",
        ...slug.messages,
      ];
    }
  }

  return errors;
}

export function handleServiceClientErrors(gatewayError: GatewayError) {
  const errors: { [key: string]: string[] } = {};
  switch (gatewayError.code) {
    case 400:
      errors.server = [gatewayError.message];
      return errors;
    case 401:
      errors.server = [gatewayError.message];
      return errors;
    case 403:
      errors.server = [gatewayError.message];
      return errors;
    case 404:
      errors.server = [gatewayError.message];
      return errors;
    case 405:
      errors.server = [gatewayError.message];
      return errors;
    case 422:
      switch (true) {
        case gatewayError.message.includes("name"):
          errors.name = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("owner"):
          errors.owner = [gatewayError.message];
          return errors;
        case gatewayError.message.includes(ErrPasswordUsedPreviously):
          errors.confirm_password = [gatewayError.message];
          return errors;
        case gatewayError.message.includes(ErrNewConfirmPwMismatch):
          errors.confirm_password = [gatewayError.message];
          return errors;
        case gatewayError.message.includes(ErrPasswordInvalid):
          errors.confirm_password = [gatewayError.message];
          return errors;
        case gatewayError.message.includes(ErrPasswordInvalidContains):
          errors.confirm_password = [gatewayError.message];
          return errors;
        default:
          errors.server = [gatewayError.message];
          return errors;
      }
    default:
      errors.server = ["Unhandled error calling gateway service."];
      return errors;
  }
}
