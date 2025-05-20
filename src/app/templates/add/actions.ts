"use server";

import { checkForSessionCookie } from "@/components/checkCookies";
import { TemplateActionCmd } from "@/components/forms";
import {
  handleTemplateErrors,
  TaskTemplate,
  TaskTemplateCmd,
  validateAssigneesUsernames,
  validateTaskTemplate,
} from "..";
import { isGatewayError } from "@/app/api";
import { redirect } from "next/navigation";

export async function handleTemplateAdd(
  previousState: TemplateActionCmd,
  formData: FormData
) {
  // get session token
  const sessionCookie = await checkForSessionCookie();

  const csrf = previousState.csrf;
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    console.log("CSRF token is mission or not well formed");
    throw new Error(
      "CSRF token is missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  let add: TaskTemplate = {
    // id omitted
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    cadence: formData.get("cadence") as string,
    category: formData.get("category") as string,
    is_calculated: formData.get("is_calculated") === "on" ? true : false,
    // slug omitted
    // created_at omitted
    is_archived: formData.get("is_archived") === "on" ? true : false,
  };

  // check task template fields
  const errors = validateTaskTemplate(add);
  if (errors && Object.keys(errors).length > 0) {
    return {
      csrf: csrf,
      // slug omitted because doesn't exist yet
      template: add,
      errors: errors,
    } as TemplateActionCmd;
  }

  // check assignees usernames
  const usernames = formData.getAll("assignees[]") as string[];
  const assigneesErrors = validateAssigneesUsernames(usernames);
  if (assigneesErrors && Object.keys(assigneesErrors).length > 0) {
    return {
      csrf: csrf,
      // slug omitted because doesn't exist yet
      template: add,
      errors: assigneesErrors,
    } as TemplateActionCmd;
  }

  // build cmd for createing task in gateway
  const cmd: TaskTemplateCmd = {
    csrf: csrf,
    name: add.name,
    description: add.description,
    cadence: add.cadence,
    category: add.category,
    is_calculated: add.is_calculated,
    is_archived: add.is_archived,
    assignees: usernames,
  };

  try {
    // call gateway to create a new task template
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/templates`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${sessionCookie.value}`,
        },
        body: JSON.stringify(cmd),
      }
    );
    if (apiResponse.ok) {
      add = await apiResponse.json();
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleTemplateErrors(fail);
        return {
          csrf: csrf,

          template: add,
          errors: errors,
        } as TemplateActionCmd;
      }
    }
  } catch (error) {
    throw new Error("Failed to call gateway to create a new task template");
  }

  redirect(`/templates`);
}
