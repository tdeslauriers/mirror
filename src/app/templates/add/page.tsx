import GetCsrf from "@/components/csrf-token";
import { AllowanceUser } from "@/components/forms";
import TemplateForm from "@/components/forms/task-template-form";
import Loading from "@/components/loading";
import Link from "next/link";
import { Suspense } from "react";
import { templateFormUpdate } from "./actions";
import checkForIdentityCookie from "@/components/check-for-id-cookie";
import callGatewayData from "@/components/call-gateway-data";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load task template add page: ";

export default async function AddPage() {
  // quick for redirect if auth'd cookies not present
  const cookies = await checkForIdentityCookie("/templates/add");

  // get csrf token from gateway for template form submission
  const csrf = await GetCsrf(
    cookies.session?.value ? cookies.session.value : ""
  );

  if (!csrf) {
    console.log(
      pageError + "CSRF token could not be retrieved for scope form."
    );
    throw new Error(
      pageError + "CSRF token could not be retrieved for scope form."
    );
  }

  // get list of assignees for form dropdown
  const assignees: AllowanceUser[] = await callGatewayData(
    "/templates/assignees",
    cookies.session?.value
  );

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
              slug={null}
              assignees={assignees}
              template={null}
              templateFormUpdate={templateFormUpdate}
            />
          </div>
        </Suspense>
      </main>
    </>
  );
}
