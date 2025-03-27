import checkForIdentityCookie, { UiCookies } from "@/components/check-for-id-cookie";
import GetOauthExchange from "@/components/oauth-exchange";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError: string = "Failed to load assignments page: ";

export default async function TemplatesPage() {
  // quick for redirect if auth'd cookies not present
  const cookies: UiCookies = await checkForIdentityCookie("/templates");

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
            <h1>Task Assignments</h1>
            <Link href="/templates/add">
              <button>Add Task</button>
            </Link>
          </div>
        </div>
        <hr className="page-title" />
        <div className="banner">
          Tasks may be assigned to more than one person. Each person assigned to
          a task will receive thier own task record to interact with. However,
          this table will only show one unique instance of each task.
        </div>
      </main>
    </>
  );
}
