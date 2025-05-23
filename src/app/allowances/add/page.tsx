import GetCsrf from "@/components/csrf-token";
import Loading from "@/components/loading";
import Link from "next/link";
import { Suspense } from "react";
import AddAllowanceForm from "./add-allowance-form";
import { handleAddAllowance } from "./actions";
import { getAuthCookies, UiCookies } from "@/components/checkCookies";
import callGatewayData from "@/components/call-gateway-data";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load allowance add page: ";

export default async function Page() {
  // quick for redirect if auth'd cookies not present
  const cookies: UiCookies = await getAuthCookies("/allowances/add");

  // check if identity cookie has allowances_write permission
  // ie, gaurd pattern or access hint gating
  if (
    !cookies.identity ||
    !cookies.identity.ux_render?.tasks?.allowances_write
  ) {
    console.log(pageError + "User does not have allowances_write permission.");
    throw new Error(
      pageError + "You do not have permission to add allowances."
    );
  }

  // get csrf token from gateway for profile form
  const csrf = await GetCsrf(cookies.session ? cookies.session : "");

  if (!csrf) {
    console.log(
      pageError + "CSRF token could not be retrieved for scope form."
    );
    throw new Error(
      pageError + "CSRF token could not be retrieved for scope form."
    );
  }

  // get user data from gateway
  const users = await callGatewayData({
    endpoint: "/users",
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
              Allowances: <span className="highlight">add account</span>
            </h1>
            <Link href="/allowances">
              <button>Allowances Table</button>
            </Link>
          </div>
        </div>
        <hr className="page-title" />
        <div className="card-title">
          <h2>New Account</h2>
        </div>
        <Suspense fallback={<Loading />}>
          <div className="card">
            <AddAllowanceForm
              csrf={csrf}
              users={users}
              addAllowance={handleAddAllowance}
            />
          </div>
        </Suspense>
      </main>
    </>
  );
}
