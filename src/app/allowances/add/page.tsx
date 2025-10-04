import GetCsrf from "@/components/csrf-token";
import Loading from "@/components/loading";
import Link from "next/link";
import { Suspense } from "react";
import AddAllowanceForm from "./add-allowance-form";
import { handleAddAllowance } from "./actions";
import { getAuthCookies, UiCookies } from "@/components/checkCookies";
import callGatewayData from "@/components/call-gateway-data";
import handlePageLoadFailure from "@/components/errors/handle-page-load-errors";
import { User } from "@/app/users";
import { UserProfile } from "..";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load allowance add page";

export default async function Page() {
  // quick for redirect if auth'd cookies not present
  const cookies: UiCookies = await getAuthCookies("/allowances/add");

  // check if identity cookie has allowances_write permission
  // ie, gaurd pattern or access hint gating
  if (
    !cookies.identity ||
    !cookies.identity.ux_render?.tasks?.allowances_write
  ) {
    console.log(
      `${pageError} User ${cookies.identity?.username} does not have allowances_write permission.`
    );
    return handlePageLoadFailure(
      401,
      "You do not have rights to add an allowance account.",
      "/allowances"
    );
  }

  // get csrf token and users (for menu) from gateway for add allowance form
  const [csrfResult, usersResult] = await Promise.all([
    GetCsrf(cookies.session ? cookies.session : ""),
    callGatewayData<UserProfile[]>({
      endpoint: "/users",
      session: cookies.session,
    }),
  ]);

  if (!csrfResult.ok) {
    console.log(
      `Failed to fetch csrf from gateway for user ${cookies.identity?.username}: ${csrfResult.error.message}`
    );
    return handlePageLoadFailure(
      csrfResult.error.code,
      csrfResult.error.message,
      "/allowances"
    );
  }
  const csrf = csrfResult.data.csrf_token;

  if (!usersResult.ok) {
    console.log(
      `Failed to fetch users for allowance users ${cookies.identity?.username}: ${usersResult.error.message}`
    );
    return handlePageLoadFailure(
      usersResult.error.code,
      usersResult.error.message,
      "/allowances"
    );
  }
  const users = usersResult.data;

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
