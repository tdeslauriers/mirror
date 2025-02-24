import { cookies } from "next/headers";
import Privacy from "@/markdown/privacy.mdx";

export default async function PrivacyPage() {
  const cookieStore = await cookies();
  const hasIdentity = cookieStore.has("identity");
  return (
    <>
      <main className={`main ${hasIdentity ? "main-drawer" : null}`}>
        <div className={`center`}>
          <div className={`page-title`}>
            <h1>Privacy Notice</h1>
          </div>
          <hr className="page-title" />
        </div>
        <div className={`content`}>
          <Privacy />
        </div>
      </main>
    </>
  );
}
