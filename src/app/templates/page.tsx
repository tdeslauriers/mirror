import callGatewayData from "@/components/call-gateway-data";
import checkForIdentityCookie, {
  UiCookies,
} from "@/components/check-for-id-cookie";
import Link from "next/link";
import TemplatesTable from "./templates-table";

export const metadata = {
  robots: "noindex, nofollow",
};

export default async function TemplatesPage() {
  // quick for redirect if auth'd cookies not present
  const cookies: UiCookies = await checkForIdentityCookie("/templates");

  // get template data from gateway
  const templates = await callGatewayData("/templates", cookies.session?.value);

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
          <ul style={{ listStyleType: "none" }}>
            <li style={{ margin: ".5rem" }}>
              Tasks may be assigned to more than one person.
            </li>
            <li style={{ margin: ".5rem" }}>
              Each person assigned to a task will receive thier own task record
              to interact with.
            </li>
            <li style={{ margin: ".5rem" }}>
              This table will only show one unique instance of each task.
            </li>
          </ul>
        </div>

        <TemplatesTable data={templates} />
      </main>
    </>
  );
}
