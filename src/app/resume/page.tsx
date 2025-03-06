import { cookies } from "next/headers";
import Resume from "@/markdown/resume.mdx";
import Link from "next/link";

export default async function ResumePage() {
  const cookieStore = await cookies();
  const hasIdentity = cookieStore.has("identity");
  return (
    <>
      <main className={`main ${hasIdentity ? "main-drawer" : null}`}>
        <div className={`center`}></div>
        <div className={`page-title`}>
          <h1 id="summary">
            Résumé: <span className="highlight">Tom des Lauriers</span>
          </h1>
        </div>
        <hr className="page-title" />
        <div className={`content`}>
          <h2 style={{ paddingTop: "0rem" }}>About Me</h2>
          <Resume />
        </div>
      </main>
    </>
  );
}
