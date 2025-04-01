import GetCsrf from "@/components/csrf-token";
import Loading from "@/components/loading";
import Link from "next/link";
import { Suspense } from "react";
import AddAllowanceForm from "./add-allowance-form";
import { handleAddAllowance } from "./actions";
import { AllowanceUser } from "@/components/forms";
import { checkForIdentityCookie, UiCookies } from "@/components/checkCookies";
import callGatewayData from "@/components/call-gateway-data";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load allowance add page: ";

export default async function Page() {
  // quick for redirect if auth'd cookies not present
  const cookies: UiCookies = await checkForIdentityCookie("/allowances/add");

  // get csrf token from gateway for profile form
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

  // get user data from gateway
  const users: AllowanceUser[] = await callGatewayData(
    "/users",

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
