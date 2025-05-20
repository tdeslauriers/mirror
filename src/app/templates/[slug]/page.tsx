import callGatewayData from "@/components/call-gateway-data";
import { getAuthCookies } from "@/components/checkCookies";
import GetCsrf from "@/components/csrf-token";
import { AllowanceUser } from "@/components/forms";
import TemplateForm from "@/components/forms/task-template-form";
import Loading from "@/components/loading";
import { Suspense } from "react";
import { handleTemplateEdit } from "./actions";
import Link from "next/link";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load template page.";

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
    console.log(pageError + "User does not have templates_read permission.");
    throw new Error(
      pageError + "You do not have permission to view this page."
    );
  }

  // check if identity cookie has template_write permission
  let csrf: string | null = null;
  if (cookies.identity && cookies.identity.ux_render?.tasks?.templates_write) {
    // get csrf token from gateway for template form
    csrf = await GetCsrf(cookies.session ? cookies.session : "");
    if (!csrf) {
      console.log(
        `${pageError} CSRF token could not be retrieved for template ${slug}.`
      );
      throw new Error(
        `${pageError} CSRF token could not be retrieved for template ${slug}.`
      );
    }
  }

  // get list of assignees for form dropdown
  const assignees: AllowanceUser[] = await callGatewayData({
    endpoint: "/templates/assignees",
    session: cookies.session,
  });

  const template = await callGatewayData({
    endpoint: `/templates/${slug}`,
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
              Task:{" "}
              <span className="highlight">
                {template.name ? template.name : null}
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
          {template.created_at
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
            {template.id ? (
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
