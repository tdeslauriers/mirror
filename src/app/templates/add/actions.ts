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
import { redirect } from "next/navigation";

export async function handleTemplateAdd(
  previousState: TemplateActionCmd,
  formData: FormData
) {
  // get form data
  const csrf = previousState.csrf;

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

  // get auth token
  const cookies = await getAuthCookies("/templates");
  if (!cookies.ok) {
    console.log(
      `Task template add failed because could not verify session cookies: ${
        cookies.error ? cookies.error.message : "unknown error"
      }`
    );
    return {
      csrf: csrf,
      // slug omitted because doesn't exist yet
      template: add,
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
      // slug omitted because doesn't exist yet
      template: add,
      errors: {
        csrf: ["invalid CSRF token, please refresh the page and try again."],
      },
    } as TemplateActionCmd;
  }

  // check task template fields
  const errors = validateTaskTemplate(add);
  if (errors && Object.keys(errors).length > 0) {
    console.log(
      `User ${
        cookies.data.identity?.username
      } submitted invalid task template: ${JSON.stringify(errors)}`
    );
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
    console.log(
      `User ${
        cookies.data.identity?.username
      } submitted invalid assignees usernames: ${JSON.stringify(
        assigneesErrors
      )}`
    );
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
          Authorization: `${cookies.data.session}`,
        },
        body: JSON.stringify(cmd),
      }
    );
    if (apiResponse.ok) {
      add = await apiResponse.json();
      console.log(
        `User ${cookies.data.identity?.username} created new task template ${add.name}.`
      );
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleTemplateErrors(fail);
        console.log(
          `User ${
            cookies.data.identity?.username
          } task template creation failed: ${JSON.stringify(errors)}`
        );
        return {
          csrf: csrf,

          template: add,
          errors: errors,
        } as TemplateActionCmd;
      } else {
        console.log(
          `User ${cookies.data.identity?.username} task template creation failed due to unhandled gateway error.`
        );
        return {
          csrf: csrf,
          // slug omitted because doesn't exist yet
          template: add,
          errors: {
            server: [
              "Failed to create task template due to unhandled gateway error.  Please try again.",
            ],
          },
        } as TemplateActionCmd;
      }
    }
  } catch (error) {
    if ((error as Error).message) {
      console.log(
        `User ${
          cookies.data.identity?.username
        } task template creation failed: ${(error as Error).message}`
      );
      return {
        csrf: csrf,
        // slug omitted because doesn't exist yet
        template: add,
        errors: {
          server: [(error as Error).message],
        },
      } as TemplateActionCmd;
    }
    console.log(
      `User ${cookies.data.identity?.username} task template creation failed due to unknown error.`
    );
    return {
      csrf: csrf,
      // slug omitted because doesn't exist yet
      template: add,
      errors: {
        server: [
          "Failed to create task template due to unknown error.  Please try again.",
        ],
      },
    } as TemplateActionCmd;
  }

  redirect(`/templates`);
}
