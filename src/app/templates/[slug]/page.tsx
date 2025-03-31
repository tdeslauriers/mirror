import callGatewayData from "@/components/call-gateway-data";
import checkForIdentityCookie from "@/components/check-for-id-cookie";
import GetCsrf from "@/components/csrf-token";
import { AllowanceUser } from "@/components/forms";

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
            Task Template uuid:{" "}
            {template.id ? (
              <div className="highlight">{template.id}</div>
            ) : null}
          </h2>
          <h2>
            Task Template slug:{" "}
            {template.slug ? (
              <div className="highlight">{template.slug}</div>
            ) : null}
          </h2>
        </div>
      </main>
    </>
  );
}
