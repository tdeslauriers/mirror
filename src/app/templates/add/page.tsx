import GetCsrf from "@/components/csrf-token";
import { AllowanceUser } from "@/components/forms";
import TemplateForm from "@/components/forms/task-template-form";
import Loading from "@/components/loading";
import Link from "next/link";
import { Suspense } from "react";
import { getAuthCookies } from "@/components/checkCookies";
import callGatewayData from "@/components/call-gateway-data";
import { handleTemplateAdd } from "./actions";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load task template add page: ";

export default async function AddPage() {
  // quick for redirect if auth'd cookies not present
  const cookies = await getAuthCookies("/templates/add");

  // check if identity cookie has template_write permission
  // ie, gaurd pattern or access hint gating
  if (
    !cookies.identity ||
    !cookies.identity.ux_render?.tasks?.templates_write
  ) {
    console.log(pageError + "User does not have templates_write permission.");
    throw new Error(
      pageError + "You do not have permission to view this page."
    );
  }

  // get csrf token from gateway for template form submission
  const csrf = await GetCsrf(cookies.session ? cookies.session : "");

  if (!csrf) {
    console.log(
      pageError + "CSRF token could not be retrieved for scope form."
    );
    throw new Error(
      pageError + "CSRF token could not be retrieved for scope form."
    );
  }

  // get list of assignees for form dropdown
  const assignees: AllowanceUser[] = await callGatewayData({
    endpoint: "/templates/assignees",
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
