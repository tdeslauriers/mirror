import GetOauthExchange from "@/components/oauth-exchange";
import Table from "@/components/table";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const pageError: string = "Failed to load users page: ";

const columns = [
  { header: "Username", accessor: "username", sortable: true },
  { header: "Firstname", accessor: "firstname", sortable: true },
  { header: "Lastname", accessor: "lastname", sortable: true },
  { header: "Created At", accessor: "created_at", sortable: true },
  { header: "Enabled", accessor: "enabled", sortable: false },
  { header: "Account Expired", accessor: "account_expired", sortable: false },
  { header: "Account Locked", accessor: "account_locked", sortable: false },
];

export default async function UsersPage() {
  // quick for redirect if auth'd cookies not present
  const cookieStore = await cookies();
  const hasIdentity = cookieStore.has("identity")
    ? cookieStore.get("identity")
    : null;
  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;

  if (!hasIdentity) {
    const oauth = await GetOauthExchange(hasSession?.value, "/users");
    if (oauth) {
      redirect(
        `/login?client_id=${oauth.client_id}&response_type=${oauth.response_type}&state=${oauth.state}&nonce=${oauth.nonce}&redirect_url=${oauth.redirect_url}`
      );
    } else {
      redirect("/login");
    }
  }

  // check session cookie exists for api call
  if (!hasSession) {
    console.log(pageError + "session cookie is missing");
    throw new Error(pageError + "session cookie is missing");
  }

  const response = await fetch(`${process.env.GATEWAY_SERVICE_URL}/users`, {
    headers: {
      Authorization: `${hasSession?.value}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      const oauth = await GetOauthExchange(hasSession?.value, "/users");
      if (oauth) {
        redirect(
          `/login?client_id=${oauth.client_id}&response_type=${oauth.response_type}&state=${oauth.state}&nonce=${oauth.nonce}&redirect_url=${oauth.redirect_url}`
        );
      } else {
        redirect("/login");
      }
    } else {
      const fail = await response.json();
      throw new Error(fail.message);
    }
  }

  const users = await response.json();

  return (
    <>
      <main className={`main main-drawer`}>
        <div className={`center`}>
          <h1>Users</h1>
          <hr />
        </div>

        <Table data={users} columns={columns} />
      </main>
    </>
  );
}
