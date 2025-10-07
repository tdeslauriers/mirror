"use server";

import { getAuthCookies, getSessionCookie } from "@/components/checkCookies";
import { TemplateActionCmd } from "@/components/forms";
import {
  handleTemplateErrors,
  TaskTemplate,
  TaskTemplateCmd,
  validateAssigneesUsernames,
  validateTaskTemplate,
} from "..";
import { isGatewayError } from "@/app/api";
import { Server } from "node:tls";

export async function handleTemplateEdit(
  previousState: TemplateActionCmd,
  formData: FormData
) {
  // get form data
  const csrf = previousState.csrf;
  const slug = previousState.slug;

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

  // get session token
  const cookies = await getAuthCookies("/templates");
  if (!cookies.ok) {
    console.log(
      `Task template edit failed because could not verify session cookies: ${
        cookies.error ? cookies.error.message : "unknown error"
      }`
    );
    return {
      csrf: csrf,
      slug: slug,
      template: updated,
      errors: {
        server: [
          cookies.error?.message || "unknown error related to session cookies.",
        ],
      },
    } as TemplateActionCmd;
  }

  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    console.log(
      `User ${cookies.data.identity?.username} submitted empty or invalid CSRF token.`
    );
    return {
      csrf: null,
      slug: slug,
      template: updated,
      errors: {
        csrf: [
          "CSRF token is required and must be well formed. May not be tampered with.",
        ],
      },
    } as TemplateActionCmd;
  }

  // slug may not exist if adding a new template
  if (!slug || slug.trim().length < 16 || slug.trim().length > 64) {
    console.log(
      `User ${cookies.data.identity?.username} submitted empty or invalid template slug.`
    );
    return {
      csrf: csrf,
      slug: null,
      template: updated,
      errors: {
        slug: [
          "Template slug is required and must be well formed. May not be tampered with.",
        ],
      },
    } as TemplateActionCmd;
  }

  // check task template fields
  const errors = validateTaskTemplate(updated);
  if (errors && Object.keys(errors).length > 0) {
    console.log(
      `User ${
        cookies.data.identity?.username
      } submitted invalid task template data: ${JSON.stringify(errors)}`
    );
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
    console.log(
      `User ${
        cookies.data.identity?.username
      } submitted invalid assignees usernames: ${JSON.stringify(
        assigneesErrors
      )}`
    );
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
          Authorization: `${cookies.data.session}`,
        },
        body: JSON.stringify(cmd),
      }
    );
    if (apiResponse.ok) {
      const success = await apiResponse.json();
      console.log(
        `User ${cookies.data.identity?.username} successfully edited task template ${success.slug}.`
      );
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
        console.log(
          `User ${
            cookies.data.identity?.username
          } failed to edit task template: ${JSON.stringify(errors)}`
        );
        return {
          csrf: csrf,

          template: updated,
          errors: errors,
        } as TemplateActionCmd;
      } else {
        console.log(
          `User ${cookies.data.identity?.username} failed to edit task template due to unhandled gateway error.`
        );
        return {
          csrf: csrf,
          slug: slug,
          template: updated,
          errors: {
            server: [
              "Failed to edit task template due to unhandled gateway error.  Please try again.",
            ],
          },
        } as TemplateActionCmd;
      }
    }
  } catch (error) {
    console.log(
      `User ${
        cookies.data.identity?.username
      } failed to edit task template due to unknown error: ${
        (error as Error).message
      }`
    );
    return {
      csrf: csrf,
      slug: slug,
      template: updated,
      errors: {
        server: [
          `Failed to edit task template due to unknown error: ${
            (error as Error).message
          }`,
        ],
      },
    } as TemplateActionCmd;
  }
}
