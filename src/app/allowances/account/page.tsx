import callGatewayData from "@/components/call-gateway-data";
import { getAuthCookies, UiCookies } from "@/components/checkCookies";
import { Allowance } from "@/components/forms";
import AllowanceForm from "@/components/forms/allowance-form";
import Loading from "@/components/loading";
import { Suspense } from "react";
import GetCsrf from "@/components/csrf-token";
import { handleAccountEdit } from "./actions";
import Link from "next/link";
import handlePageLoadFailure from "@/components/errors/handle-page-load-errors";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load allowance account page: ";

export default async function Page() {
  // quick for redirect if auth'd cookies not present
  const cookiesResult = await getAuthCookies(`/account`);
  if (!cookiesResult.ok) {
    console.log(
      `${pageError}: failed auth cookie check: ${
        cookiesResult.error ? cookiesResult.error.message : "unknown error"
      }`
    );
    return handlePageLoadFailure(
      401,
      cookiesResult.error
        ? cookiesResult.error.message
        : "unknown error related to session cookies.",
      "/login"
    );
  }

  // check if identity cookie has allowances_read permission
  // ie, gaurd pattern or access hint gating
  if (!cookiesResult.data.identity?.ux_render?.tasks?.account_read) {
    console.log(pageError + "User does not have account_read permission.");
    throw new Error(
      pageError + "you do not have permission to view your allowance account."
    );
  }

  // get allowance account data and csrf from gateway
  const [result, csrfResult] = await Promise.all([
    callGatewayData<Allowance>({
      endpoint: `/account`,
      session: cookiesResult.data.session,
    }),
    GetCsrf(cookiesResult.data.session ?? ""),
  ]);

  if (!result.ok) {
    console.log(
      `${pageError} for user ${cookiesResult.data.identity?.username}: ${result.error.message}`
    );
    return handlePageLoadFailure(
      result.error.code,
      result.error.message,
      "/allowances"
    );
  }
  const allowance = result.data;

  if (!csrfResult.ok) {
    console.log(
      `${pageError} for user ${cookiesResult.data.identity?.username}: ${csrfResult.error.message}`
    );
    return handlePageLoadFailure(
      csrfResult.error.code,
      csrfResult.error.message,
      "/allowances"
    );
  }
  const csrf = csrfResult.data.csrf_token;

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
                  see faqs
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
              editAllowed={
                cookiesResult.data.identity?.ux_render?.tasks
                  ?.allowances_write ||
                cookiesResult.data.identity?.ux_render?.tasks?.account_write
              }
              slug={null}
              allowance={allowance}
              allowanceFormUpdate={handleAccountEdit}
            />
          </div>
        </Suspense>
      </main>
    </>
  );
}
