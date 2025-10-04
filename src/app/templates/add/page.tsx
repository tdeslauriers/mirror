import GetCsrf from "@/components/csrf-token";
import { AllowanceUser } from "@/components/forms";
import TemplateForm from "@/components/forms/task-template-form";
import Loading from "@/components/loading";
import Link from "next/link";
import { Suspense } from "react";
import { getAuthCookies } from "@/components/checkCookies";
import callGatewayData from "@/components/call-gateway-data";
import { handleTemplateAdd } from "./actions";
import handlePageLoadFailure from "@/components/errors/handle-page-load-errors";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load task template add page";

export default async function AddPage() {
  // quick for redirect if auth'd cookies not present
  const cookies = await getAuthCookies("/templates/add");

  // check if identity cookie has template_write permission
  // ie, gaurd pattern or access hint gating
  if (
    !cookies.identity ||
    !cookies.identity.ux_render?.tasks?.templates_write
  ) {
    console.log(
      `${pageError}: user ${cookies.identity?.username} does not have rights to add a task.`
    );
    return handlePageLoadFailure(
      401,
      `you do not have rights to add a task.`,
      "/templates"
    );
  }

  // get csrf token from gateway for template form submission
  const [csrfResult, assigneesResult] = await Promise.all([
    GetCsrf(cookies.session ? cookies.session : ""),
    callGatewayData<AllowanceUser[]>({
      endpoint: `/allowances/users`,
      session: cookies.session,
    }),
  ]);

  if (!csrfResult.ok) {
    console.log(
      `${pageError} for user ${cookies.identity?.username}: ${csrfResult.error.message}`
    );
    return handlePageLoadFailure(
      csrfResult.error.code,
      csrfResult.error.message,
      "/templates"
    );
  }
  const csrf = csrfResult.data.csrf_token;

  if (!assigneesResult.ok) {
    console.log(
      `${pageError} for user ${cookies.identity?.username}: ${assigneesResult.error.message}`
    );
    return handlePageLoadFailure(
      assigneesResult.error.code,
      assigneesResult.error.message,
      "/templates"
    );
  }
  const assignees = assigneesResult.data;

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
              Task: <span className="highlight">add</span>
            </h1>
            <Link href="/templates">
              <button>Assignments Table</button>
            </Link>
          </div>
        </div>
        <hr className={`page-title`} />
        <div className="banner">
          Use the cadence dropdown to create recurring tasks.
        </div>
        <div className="card-title">
          <h2>Add Task</h2>
        </div>

        <Suspense fallback={<Loading />}>
          <div className="card">
            <TemplateForm
              csrf={csrf}
              username={cookies.identity.username}
              editAllowed={cookies.identity?.ux_render?.tasks?.templates_write}
              accountVisibility={
                cookies.identity?.ux_render?.tasks?.allowances_write
              }
              slug={null}
              assignees={assignees}
              template={null}
              templateFormUpdate={handleTemplateAdd}
            />
          </div>
        </Suspense>
      </main>
    </>
  );
}
