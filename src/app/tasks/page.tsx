import callGatewayData from "@/components/call-gateway-data";
import { getAuthCookies } from "@/components/checkCookies";
import { Task, TaskQueryParams, validateUrlParams } from ".";
import {
  prepareQueryParams,
  safeSearchParams,
} from "@/validation/url_query_params";
import TaskCard from "./task_card";
import GetCsrf from "@/components/csrf-token";
export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load /tasks page: ";

export default async function TasksPage({
  searchParams,
}: Record<string, string | string[] | undefined>) {
  // check for query params
  // need to collect these before cookie check
  const rawParams = ((await searchParams) || {}) as Record<
    string,
    string | string[] | undefined
  >;

  const sanitizedParams = safeSearchParams(rawParams, {
    allowedKeys: TaskQueryParams,
  });

  // after sanitizing the params, check if user is auth'd and has tasks_read permission
  // if not, redirect to login page
  const query = new URLSearchParams(
    sanitizedParams as Record<string, string>
  ).toString();
  const fullpath = `/tasks${query ? `?${query}` : ""}`;
  const cookies = await getAuthCookies(fullpath);

  // check if identity cookie has tasks_read permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.identity || !cookies.identity.ux_render?.tasks?.tasks_read) {
    console.log(pageError + "User does not have tasks_read permission.");
    throw new Error(
      pageError + "You do not have permission to view this page."
    );
  }

  // validate and prepare task params
  const paramErrors = validateUrlParams(sanitizedParams);
  if (paramErrors.length > 0) {
    console.log("paramErrors", paramErrors);
    throw new Error(pageError + "Invalid query params: " + paramErrors);
  }

  const prepared = prepareQueryParams(sanitizedParams);

  // request task records from gateway
  const tasks = await callGatewayData({
    endpoint: "/tasks",
    searchParams: prepared,
    session: cookies.session,
  });

  // get csrf token from gateway for updating task statuses
  // check if identity cookie has template_write permission
  let csrf: string | null = null;
  if (cookies.identity && cookies.identity.ux_render?.tasks?.tasks_write) {
    // get csrf token from gateway for template form
    csrf = await GetCsrf(cookies.session ? cookies.session : "");
    if (!csrf) {
      console.log(`${pageError} CSRF token could not be retrieved for tasks.`);
      throw new Error(
        `${pageError} CSRF token could not be retrieved for template tasks.`
      );
    }
  }

  return (
    <>
      <main className="main main-drawer">
        <div className="center"></div>
        <div className="page-title">
          <div
            className="actions"
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingRight: "1rem",
            }}
          >
            <h1>Tasks</h1>
          </div>
        </div>
        <hr className="page-title" />
        <div className="task-list">
          {tasks && tasks.length <= 0 && (
            <>
              <div className="banner">
                You do not have any pending daily tasks.
              </div>
            </>
          )}

          {tasks.map((task: Task) => (
            <>
              <TaskCard
                key={task.task_slug}
                task={task}
                csrf={csrf}
                reviewAllowed={
                  cookies.identity?.ux_render?.tasks?.allowances_write
                }
              />
            </>
          ))}
        </div>
      </main>
    </>
  );
}
