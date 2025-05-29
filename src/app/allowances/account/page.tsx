import callGatewayData from "@/components/call-gateway-data";
import { getAuthCookies, UiCookies } from "@/components/checkCookies";
import { Allowance } from "@/components/forms";
import AllowanceForm from "@/components/forms/allowance-form";
import Loading from "@/components/loading";
import { Suspense } from "react";
import GetCsrf from "@/components/csrf-token";
import { handleAccountEdit } from "./actions";
import Link from "next/link";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load allowance account page: ";

export default async function Page() {
  // quick for redirect if auth'd cookies not present
  const cookies: UiCookies = await getAuthCookies(`/account`);

  // check if identity cookie has allowances_read permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.identity || !cookies.identity.ux_render?.tasks?.account_read) {
    console.log(pageError + "User does not have account_read permission.");
    throw new Error(
      pageError + "You do not have permission to view your allowance account."
    );
  }

  // get allowance account data from gateway
  const allowance: Allowance = await callGatewayData({
    endpoint: `/account`,
    session: cookies.session,
  });

  let csrf: string | null = null;
  if (cookies.identity && cookies.identity.ux_render?.tasks?.allowances_write) {
    // get csrf token from gateway for allowance form updates
    csrf = await GetCsrf(cookies.session ? cookies.session : "");

    if (!csrf) {
      console.log(
        pageError + "CSRF token could not be retrieved for scope form."
      );
      throw new Error(
        pageError + "CSRF token could not be retrieved for scope form."
      );
    }
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
              editAllowed={
                cookies.identity?.ux_render?.tasks?.allowances_write ||
                cookies.identity?.ux_render?.tasks?.account_write
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
