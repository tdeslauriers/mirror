"use server";

import { checkUuid } from "@/validation/user_fields";
import { Task, TaskStatusCmd, validateStatus } from ".";

import { getAuthCookies, getSessionCookie } from "@/components/checkCookies";
import { isGatewayError } from "../api";

// NOTE: throws in this function are ok because caught by the caller, not nextjs
export async function updateTaskStatusAction(
  taskSlug: string | null,
  csrf: string | null,
  status: string | null
) {
  // get session token
  const cookies = await getAuthCookies("/tasks");
  if (!cookies.ok) {
    console.log(
      `Task status update failed because could not verify session cookies: ${
        cookies.error ? cookies.error.message : "unknown error"
      }`
    );
    throw new Error(
      cookies.error
        ? cookies.error.message
        : "unknown error related to session cookies."
    );
  }

  // field level validation
  // check task slug
  if (!taskSlug || taskSlug === "") {
    console.log(
      `user ${cookies.data.identity?.username} submitted empty task slug.`
    );
    throw new Error("Task slug is required.");
  }
  const checkSlug = checkUuid(taskSlug);
  if (!checkSlug.isValid) {
    const errMessage = `Invalid task slug: ${checkSlug.messages.join("; ")}.`;
    console.log(
      `User ${cookies.data.identity?.username} submitted invalid task slug: ${errMessage}`
    );
    throw new Error(errMessage);
  }

  // check csrf token
  if (!csrf || csrf === "") {
    console.log(
      `user ${cookies.data.identity?.username} submitted empty CSRF token.`
    );
    throw new Error("CSRF token is required.");
  }
  const checkCsrf = checkUuid(csrf);
  if (!checkCsrf.isValid) {
    const errMessage = `Invalid CSRF: ${checkCsrf.messages.join("; ")}.`;
    console.log(
      `User ${cookies.data.identity?.username} submitted invalid CSRF token: ${errMessage}`
    );
    throw new Error(errMessage);
  }

  // check status
  if (!status || status === "") {
    console.log(
      `user ${cookies.data.identity?.username} submitted empty status.`
    );
    throw new Error("Status is required.");
  }
  validateStatus(status); // throws if invalid

  const cmd: TaskStatusCmd = {
    csrf: csrf,
    task_slug: taskSlug,
    status: status,
  };

  // call gateway to update task status
  try {
    const response = await fetch(`${process.env.GATEWAY_SERVICE_URL}/tasks`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: cookies.data.session ?? "",
      },
      body: JSON.stringify(cmd),
    });

    if (response.ok) {
      const success = await response.json();
      if (status === "is_complete") {
        return { confirmed: success.is_complete };
      } else if (status === "is_satisfactory") {
        return { confirmed: success.is_satisfactory };
      } else if (status === "is_proactive") {
        return { confirmed: success.is_proactive };
      }
    } else {
      const fail = await response.json();
      if (isGatewayError(fail)) {
        console.log(
          `User ${cookies.data.identity?.username} task status update failed: ${fail.message}`
        );
        throw new Error(fail.message);
      } else {
        console.log(
          `User ${cookies.data.identity?.username} task status update failed due to unhandled gateway error.`
        );
        throw new Error(
          "Failed to update status due to unhandled gateway error.  Please try again."
        );
      }
    }
  } catch (error) {
    if ((error as Error).message) {
      console.log(
        `User ${cookies.data.identity?.username} task status update failed: ${
          (error as Error).message
        }`
      );
      throw new Error((error as Error).message);
    }
    console.log(
      `User ${cookies.data.identity?.username} task status update failed due to unknown error.`
    );
    throw new Error(
      "Failed to call task service gateway. If this error persists, please contact me."
    );
  }
}
