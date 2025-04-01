import { AllowanceUser } from "@/components/forms";
import { checkEmail } from "@/validation/user_fields";
import { ErrMsgGeneric, GatewayError } from "../api";

export type TaskTemplate = {
  id?: string;
  name?: string;
  description?: string;
  cadence?: string;
  category?: string;
  slug?: string;
  created_at?: string;
  is_archived?: boolean;
  assignees?: AllowanceUser[]; // only the usernames sent to the gateway
};

export type TaskTemplateCmd = {
  csrf?: string;

  name?: string;
  description?: string;
  cadence?: string;
  category?: string;
  slug?: string;
  created_at?: string;
  is_archived?: boolean;
  assignees?: string[]; // only the usernames sent to the gateway
};

export const cadence: string[] = [
  "ADHOC",
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "ANNUALLY",
];

export const category: string[] = [
  "BILLS",
  "CAR",
  "DEV",
  "HEALTH",
  "HOUSE",
  "KIDS",
  "PETS",
  "SPORTS",
  "STUDY",
  "WORK",
  "YARD",
  "OTHER",
];

export function validateTaskTemplate(template: TaskTemplate): {
  [key: string]: string[];
} {
  const errors: { [key: string]: string[] } = {};

  if (
    !template.name ||
    template.name.trim().length < 1 ||
    template.name.trim().length > 64
  ) {
    errors.name = ["Name is required and must be between 1 and 64 characters"];
  }

  if (
    !template.description ||
    template.description.trim().length < 1 ||
    template.description.trim().length > 255
  ) {
    errors.description = [
      "Description is required and must be between 1 and 255 characters",
    ];
  }

  if (!template.category || template.category.trim().length < 1) {
    errors.category = ["Category is required"];
  }

  // check if category is from the list
  if (template.category && !category.includes(template.category)) {
    errors.category = ["Category is not valid selection"];
  }

  if (!template.cadence || template.cadence.trim().length < 1) {
    errors.cadence = ["Cadence is required"];
  }

  // check if cadence is from the list
  if (template.cadence && !cadence.includes(template.cadence)) {
    errors.cadence = ["Cadence is not valid selection"];
  }

  return errors;
}

export function validateAssigneesUsernames(usernames: string[]) {
  const errors: { [key: string]: string[] } = {};

  if (!usernames || usernames.length < 1) {
    errors.assignees = [
      "At least on assignee is required to create a task/task template",
    ];
  }

  usernames.forEach((username) => {
    if (!username || username.trim().length < 1) {
      errors.assignees = ["Assignee username is required"];
    }

    if (username && username.trim().length > 64) {
      errors.assignees = ["Assignee username is too long"];
    }

    // check if username is valid email address
    const check = checkEmail(username);
    if (!check.isValid) {
      errors.assignees.push(...check.messages);
    }
  });

  return errors;
}

export function handleTemplateErrors(gatewayError: GatewayError) {
  const errors: { [key: string]: string[] } = {};

  switch (gatewayError.code) {
    case 400:
      errors.server = [gatewayError.message];
      return errors;
    case 401:
      errors.server = [gatewayError.message];
    case 403:
      errors.server = [gatewayError.message];
    case 404:
      errors.server = [gatewayError.message];
    case 405:
      errors.server = [gatewayError.message];
      return errors;
    case 422:
      // temporary fix for now: determine which error received
      switch (true) {
        case gatewayError.message.includes("name"):
          errors.name = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("description"):
          errors.description = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("cadence"):
          errors.cadence = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("category"):
          errors.category = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("assignees"):
          errors.assignees = [gatewayError.message];
          return errors;
        default:
          break;
      }
    default:
      errors.server = [gatewayError.message || ErrMsgGeneric];
      return errors;
  }
}
