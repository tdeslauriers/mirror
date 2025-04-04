import callGatewayData from "@/components/call-gateway-data";
import { checkForIdentityCookie } from "@/components/checkCookies";
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
  const cookies = await checkForIdentityCookie(`/templates/${slug}`);

  // get csrf token from gateway for service form
  const csrf = await GetCsrf(
    cookies.session?.value ? cookies.session.value : ""
  );

  if (!csrf) {
    console.log(
      `${pageError} CSRF token could not be retrieved for service client ${slug}.`
    );
    throw new Error(
      `${pageError} CSRF token could not be retrieved for service client ${slug}.`
    );
  }

  // get list of assignees for form dropdown
  const assignees: AllowanceUser[] = await callGatewayData(
    "/templates/assignees",
    cookies.session?.value
  );

  const template = await callGatewayData(
    `/templates/${slug}`,
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
