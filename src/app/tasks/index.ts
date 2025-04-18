import { error } from "console";
import { AllowanceUser } from "@/components/forms";
import { EMAIL_REGEX, UUID_REGEX } from "@/validation/user_fields";
import { TaskCadence, TaskCategory } from "../templates";

// This is a composite object consisting of the individual task record and fields from the task template
export type Task = {
  id?: string; // from task
  name?: string; // from template
  description?: string; // from template
  cadence?: string; // from template
  category?: string; // from template
  created_at?: string; // from task
  is_complete?: boolean; // from task
  is_satisfactory?: boolean; // from task
  is_proactive?: boolean; // from task
  slug?: string; // from task
  is_archived?: boolean; // from task
  assignees?: AllowanceUser;
};

// Allowed query params for the tasks page
// Note: includes composite fields from task and template
export const TaskQueryParams: string[] = [
  "view",
  "assignee",
  "name",
  "cadence",
  "category",
  "is_complete",
  "is_satisfactory",
  "is_proactive",
  "is_archived",
];

export const TaskViews: string[] = ["today"];
export const AssigneeCodes: string[] = ["me", "all"];

export function validateUrlParams(
  searchParams: Record<string, string | string[] | undefined>
) {
  let errors: string[] = [];

  // check view
  if (searchParams["view"]) {
    // check if view is an array: only one value allowed
    if (Array.isArray(searchParams["view"])) {
      console.log("Only one view param allowed");
      errors.push("Only one view param allowed");
    }
    // check if view is a string
    if (typeof searchParams["view"] !== "string") {
      console.log("View param must be a string");
      errors.push("View param must be a string");
    }
    // check if view is empty
    if (searchParams["view"] === "") {
      console.log("View param cannot be empty");
      errors.push("View param cannot be empty");
    }

    // check if view is a known/allowed view name
    if (!TaskViews.includes(searchParams["view"] as string)) {
      console.log("Invalid view param: ", searchParams["view"]);
      errors.push("Invalid view param: " + searchParams["view"]);
    }
  }

  // if assignee param exists, check if it is a valid username, uuid, or known shorthand like "me" or "all"
  if (searchParams["assignee"]) {
    if (Array.isArray(searchParams["assignee"])) {
      searchParams["assignee"].forEach((assignee) => {
        const assigneeErrors = validateAssignee(assignee);
        if (assigneeErrors.length > 0) {
          console.log("Assignee param errors: ", assigneeErrors);
          errors.push(...assigneeErrors);
        }
      });
    } else if (typeof searchParams["assignee"] === "string") {
      const assigneeErrors = validateAssignee(searchParams["assignee"]);
      if (assigneeErrors.length > 0) {
        console.log("Assignee param errors: ", assigneeErrors);
        errors.push(...assigneeErrors);
      }
    }
  }

  // name is check sufficiently safeSearchParams

  // check cadence param if exists
  if (searchParams["cadence"]) {
    // check if cadence is an array: only one value allowed
    if (Array.isArray(searchParams["cadence"])) {
      searchParams["cadence"].forEach((cadence) => {
        if (!TaskCadence.includes(cadence.trim().toUpperCase())) {
          console.log("Invalid cadence param: ", cadence);
          errors.push("Invalid cadence param: " + cadence);
        }
      });
    } else if (typeof searchParams["cadence"] !== "string") {
      if (!TaskCadence.includes(searchParams["cadence"] as string)) {
        console.log("Invalid cadence param: ", searchParams["cadence"]);
        errors.push("Invalid cadence param: " + searchParams["cadence"]);
      }
    }
  }

  // check category param if exists
  if (searchParams["category"]) {
    // check if category is an array
    if (Array.isArray(searchParams["category"])) {
      searchParams["category"].forEach((category) => {
        if (!TaskCategory.includes(category.trim().toUpperCase())) {
          console.log("Invalid category param: ", category);
          errors.push("Invalid category param: " + category);
        }
      });
    } else if (typeof searchParams["category"] !== "string") {
      if (!TaskCategory.includes(searchParams["category"] as string)) {
        console.log("Invalid category param: ", searchParams["category"]);
        errors.push("Invalid category param: " + searchParams["category"]);
      }
    }
  }

  // check is_complete param is boolean (in string form) if exists
  if (searchParams["is_complete"]) {
    const checkIsComplete = validateBoolParam(searchParams["is_complete"]);
    if (checkIsComplete.length > 0) {
      const errMsg = "is_complete param errors: " + checkIsComplete.join("; ");
      console.log(errMsg);
      errors.push(errMsg);
    }
  }

  // check if is_satisfactory is a boolean if it exists
  if (searchParams["is_satisfactory"]) {
    const checkIsSatisfactory = validateBoolParam(
      searchParams["is_satisfactory"]
    );
    if (checkIsSatisfactory.length > 0) {
      const errMsg =
        "is_satisfactory param errors: " + checkIsSatisfactory.join("; ");
      console.log(errMsg);
      errors.push(errMsg);
    }
  }

  // check if is_proactive is a boolean if it exists
  if (searchParams["is_proactive"]) {
    const checkIsProactive = validateBoolParam(searchParams["is_proactive"]);
    if (checkIsProactive.length > 0) {
      const errMsg =
        "is_proactive param errors: " + checkIsProactive.join("; ");
      console.log(errMsg);
      errors.push(errMsg);
    }
  }

  // check if is_archived is a boolean if it exists
  if (searchParams["is_archived"]) {
    const checkIsArchived = validateBoolParam(searchParams["is_archived"]);
    if (checkIsArchived.length > 0) {
      const errMsg = "is_archived param errors: " + checkIsArchived.join("; ");
      console.log(errMsg);
      errors.push(errMsg);
    }
  }

  return errors;
}

// validateAssignee checks if the assignee param is a valid UUID, email address, or known shorthand code like "me" or "all"
function validateAssignee(assignee: string) {
  let errors: string[] = [];
  if (typeof assignee !== "string") {
    console.log("Assignee param must be a string, but was: ", typeof assignee);
    errors.push("Assignee param must be a string, but was: " + typeof assignee);
  }

  if (assignee === "") {
    console.log("Assignee param cannot be empty");
    errors.push("Assignee param cannot be empty");
  }

  if (
    !UUID_REGEX.test(assignee.trim()) ||
    !EMAIL_REGEX.test(assignee.trim()) ||
    !AssigneeCodes.includes(assignee.trim())
  ) {
    console.log(
      "Assignee param must be a valid UUID, email address, or known shorthand code like 'me' or 'all'"
    );
    errors.push(
      "Assignee param must be a valid UUID, email address, or known shorthand code like 'me' or 'all'"
    );
  }

  return errors;
}

// validateBoolParam checks if a string is a boolean in string form like "true" or "false"
// Note: cannot be an array since there there are only two mutually exclusive values, the same as all, or no param
function validateBoolParam(param: string | string[]) {
  let errors: string[] = [];

  if (Array.isArray(param)) {
    console.log("Cannot set more than one boolean param: ", param);
    errors.push("Cannot set more than one boolean param: " + param);
  }

  if (typeof param !== "string") {
    console.log(
      "param must be a boolean in string from like 'true' or 'false'"
    );
    errors.push(
      "param must be a boolean in string from like 'true' or 'false'"
    );
  }

  // check if is_complete is a boolean
  if (param !== "true" && param !== "false") {
    console.log(
      "param must be a boolean in string from like 'true' or 'false'"
    );
    errors.push(
      "param must be a boolean in string from like 'true' or 'false'"
    );
  }

  return errors;
}
