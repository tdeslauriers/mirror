import { getAuthCookies } from "@/components/checkCookies";
import GetCsrf from "@/components/csrf-token";
import PermissionForm from "@/components/forms/permission-form";
import Loading from "@/components/loading";
import Link from "next/link";
import { Suspense } from "react";
import { handlePermissionAdd } from "./actions";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load add permission page: ";

export default async function PermissionsAddPage() {
  // quick for redirect if auth'd cookies not present
  const cookies = await getAuthCookies("/permissions/add");

  // check if identity cookie has scopes_write permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.identity || !cookies.identity.ux_render?.users?.scope_write) {
    console.log(pageError + "User does not have scopes_write permission.");
    throw new Error(pageError + "You do not have permission to add scopes.");
  }

  // get csrf token from gateway for profile form
  const csrf = await GetCsrf(cookies.session ? cookies.session : "");

  if (!csrf) {
    console.log(
      pageError + "CSRF token could not be retrieved for permission form."
    );
    throw new Error(
      pageError + "CSRF token could not be retrieved for permission form."
    );
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
              Permission: <span className="highlight">add</span>
            </h1>
            <Link href="/permissions">
              <button>Permissions Table</button>
            </Link>
          </div>
        </div>
        <hr className={`page-title`} />

        {/* banner */}
        <div className="banner">
          <ul>
            <li>
              Permissions are fine-grained access controls that are attached to
              users and resources, tying the two together.
            </li>
            <li>
              <strong>Note:</strong> a permission alone will not grant access.
              One must also have a scope allowing access to the resource&apos;s
              or service&apos;s endpoint.
            </li>
          </ul>
        </div>

        <div className="card-title">
          <h2>Add Permission</h2>
        </div>

        {/* permission form */}
        <Suspense fallback={<Loading />}>
          <div className="card">
            <PermissionForm
              csrf={csrf}
              editAllowed={cookies.identity?.ux_render?.users?.scope_write}
              slug={null}
              permission={null}
              permissionFormUpdate={handlePermissionAdd}
            />
          </div>
        </Suspense>
      </main>
    </>
  );
}
