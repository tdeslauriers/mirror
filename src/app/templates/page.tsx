import callGatewayData from "@/components/call-gateway-data";

import Link from "next/link";
import TemplatesTable from "./templates-table";
import { getAuthCookies, UiCookies } from "@/components/checkCookies";
import { AllowanceUser } from "@/components/forms";
import { TaskTemplate } from ".";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load templates page: ";

export default async function TemplatesPage() {
  // quick for redirect if auth'd cookies not present
  const cookies: UiCookies = await getAuthCookies("/templates");

  // check if identity cookie has template_read permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.identity || !cookies.identity.ux_render?.tasks?.templates_read) {
    console.log(pageError + "User does not have templates_read permission.");
    throw new Error(
      pageError + "You do not have permission to view this page."
    );
  }

  // get template data from gateway
  const templates: TaskTemplate[] = await callGatewayData({
    endpoint: "/templates",
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
            <h1>Task Templates and Assignments</h1>
            {cookies.identity &&
              cookies.identity.ux_render?.tasks?.templates_write && (
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
          username={cookies.identity.username}
          accountVisibility={cookies.identity.ux_render.tasks.allowances_write}
        />
      </main>
    </>
  );
}
