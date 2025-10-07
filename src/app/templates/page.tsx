import callGatewayData from "@/components/call-gateway-data";
import Link from "next/link";
import TemplatesTable from "./templates-table";
import { getAuthCookies } from "@/components/checkCookies";
import { TaskTemplate } from ".";
import handlePageLoadFailure from "@/components/errors/handle-page-load-errors";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load templates page";

export default async function TemplatesPage() {
  // quick for redirect if auth'd cookies not present
  const cookies = await getAuthCookies("/templates");
  if (!cookies.ok) {
    console.log(
      `${pageError}: could not verify session cookies: ${
        cookies.error ? cookies.error.message : "unknown error"
      }`
    );
    return handlePageLoadFailure(
      401,
      cookies.error
        ? cookies.error.message
        : "unknown error related to session cookies.",
      "/login"
    );
  }

  // check if identity cookie has template_read permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.data.identity?.ux_render?.tasks?.templates_read) {
    console.log(
      `${pageError}: user ${cookies.data.identity?.username} does not have rights to view /templates.`
    );
    return handlePageLoadFailure(
      401,
      `you do not have rights to view /templates.`
    );
  }

  // get template data from gateway
  const result = await callGatewayData<TaskTemplate[]>({
    endpoint: "/templates",
    session: cookies.data.session,
  });
  if (!result.ok) {
    console.log(
      `${pageError} for user ${cookies.data.identity?.username}: ${result.error.message}`
    );
    return handlePageLoadFailure(result.error.code, result.error.message);
  }
  const templates = result.data;

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
            <h1>Task Templates and Assignments</h1>
            {cookies.data.identity &&
              cookies.data.identity.ux_render?.tasks?.templates_write && (
                <Link href="/templates/add">
                  <button>Add Task/Template</button>
                </Link>
              )}
          </div>
        </div>
        <hr className="page-title" />
        <div className="banner">
          <ul>
            <li style={{ margin: ".5rem" }}>
              This table will only show one unique instance of each task type,
              ie, they are templates for recurring task creation.
            </li>
            <li style={{ margin: ".5rem" }}>
              Each person assigned to a task template will receive thier own
              task record to interact with on the recurrance cadence.
            </li>
            <li style={{ margin: ".5rem" }}>
              Ad hoc task templates will be archived upon closure of the task
              record, and will no longer show in this table.
            </li>
          </ul>
        </div>

        <TemplatesTable
          data={templates}
          username={cookies.data.identity.username}
          accountVisibility={
            cookies.data.identity.ux_render.tasks.allowances_write
          }
        />
      </main>
    </>
  );
}
