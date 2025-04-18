import callGatewayData from "@/components/call-gateway-data";
import { getAuthCookies } from "@/components/checkCookies";
import { Task, TaskQueryParams, validateUrlParams } from ".";
import {
  prepareQueryParams,
  safeSearchParams,
} from "@/validation/url_query_params";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load /tasks page: ";

export default async function TasksPage({
  searchParams,
}: Record<string, string | string[] | undefined>) {
  // quick for redirect if auth'd cookies not present
  const cookies = await getAuthCookies("/tasks");

  // check if identity cookie has tasks_read permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.identity || !cookies.identity.ux_render?.tasks?.tasks_read) {
    console.log(pageError + "User does not have tasks_read permission.");
    throw new Error(
      pageError + "You do not have permission to view this page."
    );
  }

  // check for query params
  const rawParams = ((await searchParams) || {}) as Record<
    string,
    string | string[] | undefined
  >;

  // TODO check if none: get all (that a user is allowed to see)

  const sanitizedParams = safeSearchParams(rawParams, {
    allowedKeys: TaskQueryParams,
  });

  // validate and prepare task params
  const paramErrors = validateUrlParams(sanitizedParams);
  if (paramErrors.length > 0) {
    console.log("paramErrors", paramErrors);
    throw new Error(pageError + "Invalid query params: " + paramErrors);
  }

  const prepared = prepareQueryParams(sanitizedParams);

  const tasks: Task[] = await callGatewayData({
    endpoint: "/tasks",
    searchParams: prepared,
    session: cookies.session,
  });

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
            <h1>
              All Tasks: <span className="highlight">Today</span>
            </h1>
          </div>
        </div>
        <hr className="page-title" />
      </main>
    </>
  );
}
