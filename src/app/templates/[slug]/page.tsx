import callGatewayData from "@/components/call-gateway-data";
import { getAuthCookies } from "@/components/checkCookies";
import GetCsrf from "@/components/csrf-token";
import { AllowanceUser } from "@/components/forms";
import TemplateForm from "@/components/forms/task-template-form";
import Loading from "@/components/loading";
import { Suspense } from "react";
import { handleTemplateEdit } from "./actions";
import Link from "next/link";
import handlePageLoadFailure from "@/components/errors/handle-page-load-errors";
import { TaskTemplate } from "..";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load template page";

export default async function TemplatesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;

  // quick check for redirect if auth'd cookies not present
  const cookies = await getAuthCookies(`/templates/${slug}`);

  // check if identity cookie has template_read permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.identity || !cookies.identity.ux_render?.tasks?.templates_read) {
    console.log(
      `${pageError}: user ${cookies.identity?.username} does not have rights to view /templates/${slug}.`
    );
    return handlePageLoadFailure(
      401,
      `you do not have rights to view /templates/${slug}.`,
      "/templates"
    );
  }

  // check if identity cookie has template_write permission
  let csrf: string | null = null;
  let template: TaskTemplate | null = null;
  let assignees: AllowanceUser[] = [];
  if (cookies.identity && cookies.identity.ux_render?.tasks?.templates_write) {
    // get csrf, task template, and assignes (for menu) from gateway for template form
    const [csrfResult, templateResult, assigneesResult] = await Promise.all([
      GetCsrf(cookies.session ? cookies.session : ""),
      callGatewayData<TaskTemplate>({
        endpoint: `/templates/${slug}`,
        session: cookies.session,
      }),
      callGatewayData<AllowanceUser[]>({
        endpoint: `/templates/assignees`,
        session: cookies.session,
      }),
    ]);

    if (!csrfResult.ok) {
      console.log(
        `Failed to get CSRF for user ${cookies.identity?.username}: ${csrfResult.error.message}`
      );
      return handlePageLoadFailure(
        csrfResult.error.code,
        csrfResult.error.message,
        "/templates"
      );
    }
    csrf = csrfResult.data.csrf_token;

    if (!templateResult.ok) {
      console.log(
        `Failed to get /template/${slug} for user ${cookies.identity?.username}: ${templateResult.error.message}`
      );
      return handlePageLoadFailure(
        templateResult.error.code,
        templateResult.error.message,
        "/templates"
      );
    }
    template = templateResult.data;

    if (!assigneesResult.ok) {
      console.log(
        `Failed to get assignees for template menu for user ${cookies.identity?.username}: ${assigneesResult.error.message}`
      );
      return handlePageLoadFailure(
        assigneesResult.error.code,
        `Failed to load template assignees for menu: ${assigneesResult.error.message}`,
        "/templates"
      );
    }
    assignees = assigneesResult.data;
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
            <h1>
              Task:{" "}
              <span className="highlight">
                {template?.name ? template.name : null}
              </span>
            </h1>
            <Link href="/templates">
              <button>Assignments Table</button>
            </Link>
          </div>
        </div>
        <hr className={`page-title`} />
        <div className="banner">
          Task created{" "}
          {template?.created_at
            ? new Date(template.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : null}
        </div>
        <div className="card-title">
          <h2>
            Template uuid:{" "}
            {template?.id ? (
              <span className="highlight">{template.id}</span>
            ) : null}
          </h2>
        </div>

        <Suspense fallback={<Loading />}>
          <div className="card">
            <TemplateForm
              csrf={csrf}
              username={cookies.identity?.username}
              editAllowed={cookies.identity?.ux_render?.tasks?.templates_write}
              accountVisibility={
                cookies.identity?.ux_render?.tasks?.allowances_write
              }
              slug={slug}
              assignees={assignees}
              template={template}
              templateFormUpdate={handleTemplateEdit}
            />
          </div>
        </Suspense>
      </main>
    </>
  );
}
