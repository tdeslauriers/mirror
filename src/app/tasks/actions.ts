"use server";

import { checkUuid } from "@/validation/user_fields";
import { Task, TaskStatusCmd, validateStatus } from ".";

import { checkForSessionCookie } from "@/components/checkCookies";
import { isGatewayError } from "../api";

export async function updateTaskStatusAction(
  taskSlug: string | null,
  csrf: string | null,
  status: string | null
) {
  // get session token
  const session = await checkForSessionCookie();

  // field level validation
  // check task slug
  if (!taskSlug || taskSlug === "") {
    console.log("Task slug is required.");
    throw new Error("Task slug is required.");
  }
  const checkSlug = checkUuid(taskSlug);
  if (!checkSlug.isValid) {
    const errMessage = `Invalid task slug: ${checkSlug.messages.join("; ")}.`;
    console.log(errMessage);
    throw new Error(errMessage);
  }

  // check csrf token
  if (!csrf || csrf === "") {
    console.log("CSRF token is required.");
    throw new Error("CSRF token is required.");
  }
  const checkCsrf = checkUuid(csrf);
  if (!checkCsrf.isValid) {
    const errMessage = `Invalid CSRF: ${checkCsrf.messages.join("; ")}.`;
    console.log(errMessage);
    throw new Error(errMessage);
  }

  // check status
  if (!status || status === "") {
    console.log("Status is required.");
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
    const response = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/tasks/${taskSlug}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: session?.value,
        },
        body: JSON.stringify(cmd),
      }
    );

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
        throw new Error(fail.message);
      } else {
        throw new Error(
          "Failed to update status due to unhandled gateway error.  Please try again."
        );
      }
    }
  } catch (error) {
    throw new Error(
      "Failed to call task service gateway. If this error persists, please contact me."
    );
  }
}
