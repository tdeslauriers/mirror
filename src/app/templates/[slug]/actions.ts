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

export async function handleTemplateEdit(
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

  // slug may not exist if adding a new template
  const slug = previousState.slug;
  if (!slug || slug.trim().length < 16 || slug.trim().length > 64) {
    console.log("Template slug is missing or not well formed");
    throw new Error(
      "Template slug is missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  const updated: TaskTemplate = {
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
  const errors = validateTaskTemplate(updated);
  if (errors && Object.keys(errors).length > 0) {
    return {
      csrf: csrf,
      slug: slug,
      template: updated,
      errors: errors,
    } as TemplateActionCmd;
  }

  // check assignees usernames
  const usernames = formData.getAll("assignees[]") as string[];
  const assigneesErrors = validateAssigneesUsernames(usernames);
  if (assigneesErrors && Object.keys(assigneesErrors).length > 0) {
    return {
      csrf: csrf,
      slug: slug,
      template: updated,
      errors: assigneesErrors,
    } as TemplateActionCmd;
  }

  // build cmd for createing task in gateway
  const cmd: TaskTemplateCmd = {
    csrf: csrf,
    name: updated.name,
    description: updated.description,
    cadence: updated.cadence,
    category: updated.category,
    is_calculated: updated.is_calculated,
    is_archived: updated.is_archived,
    assignees: usernames,
  };

  try {
    // call gateway to create a new task template
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/templates/${slug}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${sessionCookie.value}`,
        },
        body: JSON.stringify(cmd),
      }
    );
    if (apiResponse.ok) {
      const success = await apiResponse.json();
      return {
        csrf: csrf,
        slug: success.slug,
        template: success,
        errors: {},
      } as TemplateActionCmd;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleTemplateErrors(fail);
        return {
          csrf: csrf,

          template: updated,
          errors: errors,
        } as TemplateActionCmd;
      } else {
        throw new Error(
          "unhandled error resulted from call to gateway failed to edit task template",
          fail
        );
      }
    }
  } catch (error) {
    throw new Error("Failed to call gateway to edit task template");
  }
}
