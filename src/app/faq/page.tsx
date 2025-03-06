import { cookies } from "next/headers";
import Faq from "@/markdown/faq.mdx";

export default async function FaqPage() {
  const cookieStore = await cookies();
  const hasIdentity = cookieStore.has("identity");
  return (
    <>
      <main className={`main ${hasIdentity ? "main-drawer" : null}`}>
        <div className={`center`}></div>
        <div className={`page-title`}>
          <h1>Frequently Asked Questions</h1>
        </div>
        <hr className="page-title" />
        <div style={{ fontStyle: "italic" }}>
          None of these questions are frequently asked because no one visits
          this website.
        </div>
        <div className={`content`}>
          <Faq />
        </div>
      </main>
    </>
  );
}
