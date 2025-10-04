import GetCsrf from "@/components/csrf-token";
import AllowanceForm from "@/components/forms/allowance-form";
import Loading from "@/components/loading";
import Link from "next/link";
import { Suspense } from "react";
import { handleAllowanceEdit } from "./actions";
import { getAuthCookies, UiCookies } from "@/components/checkCookies";
import callGatewayData from "@/components/call-gateway-data";
import { Allowance } from "@/components/forms";
import handlePageLoadFailure from "@/components/errors/handle-page-load-errors";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load allowance record page";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // get slug param from url
  const slug = (await params).slug;

  // quick for redirect if auth'd cookies not present
  const cookies: UiCookies = await getAuthCookies(`/allowances/${slug}`);

  // check if identity cookie has allowances_read permission
  // ie, gaurd pattern or access hint gating
  if (
    !cookies.identity ||
    !cookies.identity.ux_render?.tasks?.allowances_read
  ) {
    console.log(
      `${pageError}: user ${cookies.identity?.username} does not have rights to view /allowances/${slug}.`
    );
    return handlePageLoadFailure(
      401,
      `you do not have rights to view /allowances/${slug}.`,
      "/allowances"
    );
  }

  // get allowance account data from gateway
  const result = await callGatewayData<Allowance>({
    endpoint: `/allowances/${slug}`,
    session: cookies.session,
  });
  if (!result.ok) {
    console.log(
      `${pageError} for user ${cookies.identity?.username}: ${result.error.message}`
    );
    return handlePageLoadFailure(
      result.error.code,
      result.error.message,
      "/allowances"
    );
  }
  const allowance = result.data;

  let csrf: string | null = null;
  if (cookies.identity && cookies.identity.ux_render?.tasks?.allowances_write) {
    // get csrf token from gateway for allowance form updates
    const result = await GetCsrf(cookies.session ? cookies.session : "");

    if (!result.ok) {
      console.log(
        `${pageError} for user ${cookies.identity?.username}: ${result.error.message}`
      );
      return handlePageLoadFailure(
        result.error.code,
        result.error.message,
        "/allowances"
      );
    }
    csrf = result.data.csrf_token;
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
              Allowance Account:{" "}
              <span className="highlight">{allowance?.username}</span>
            </h1>

            {cookies.identity &&
              cookies.identity.ux_render?.tasks?.allowances_write && (
                <Link href={`/allowances`}>
                  <button>Allowances Table</button>
                </Link>
              )}
          </div>
        </div>
        <hr className="page-title" />
        {allowance && allowance.created_at && (
          <div className="banner">
            <ul>
              <li>
                Allowance account created{" "}
                {new Date(allowance.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </li>
              <li>
                If you want to know how allowance is calculated,{" "}
                <Link
                  className="locallink"
                  href={`/faq#how-is-allowance-calculated`}
                >
                  click here in the faq
                </Link>
                .
              </li>
            </ul>
          </div>
        )}
        <div className="card-title">
          <h2>
            Uuid:{" "}
            {allowance && allowance.id && (
              <span className="highlight">{allowance.id}</span>
            )}
          </h2>
        </div>

        <Suspense fallback={<Loading />}>
          <div className="card">
            <AllowanceForm
              csrf={csrf}
              editAllowed={cookies.identity?.ux_render?.tasks?.allowances_write}
              slug={slug}
              allowance={allowance}
              allowanceFormUpdate={handleAllowanceEdit}
            />
          </div>
        </Suspense>
      </main>
    </>
  );
}
