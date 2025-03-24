"use server";

import { TemplateActionCmd } from "@/components/forms";
import { cookies } from "next/headers";
import {
  cadence,
  handleTemplateErrors,
  TaskTemplate,
  TaskTemplateCmd,
  validateAssigneesUsernames,
  validateTaskTemplate,
} from "..";
import { isGatewayError } from "@/app/api";

export async function templateFormUpdate(
  previousState: TemplateActionCmd,
  formData: FormData
) {
  const cookieStore = await cookies();
  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;
  if (
    !hasSession ||
    hasSession.value.trim().length < 16 ||
    hasSession.value.trim().length > 64
  ) {
    throw new Error(
      "Session cookie is missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  const csrf = previousState.csrf;
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    throw new Error(
      "CSRF token is missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  // slug may not exist if adding a new template
  const slug = previousState.slug;
  if (slug && (slug.trim().length < 16 || slug.trim().length > 64)) {
    throw new Error(
      "Template slug  not well formed.  This value is required and cannot be tampered with."
    );
  }

  const updated: TaskTemplate = {
    csrf: csrf,
    // id omitted
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    cadence: formData.get("cadence") as string,
    category: formData.get("category") as string,
    // slug omitted
    // created_at omitted
    is_archived: formData.get("is_archived") === "on" ? true : false,
  };

  // check task fields
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
    is_archived: updated.is_archived,
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
          Authorization: `${hasSession.value}`,
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
          slug: slug,
          template: updated,
          errors: errors,
        } as TemplateActionCmd;
      } else {
        throw new Error(
          "unhandled error resulted from call to gateway failed to create a new task template",
          fail
        );
      }
    }
  } catch (error) {
    throw new Error("Failed to call gateway to create a new task template");
  }
}
