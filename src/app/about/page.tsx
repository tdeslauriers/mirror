// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { cookies } from "next/headers";
import About from "@/markdown/about.mdx";
import Techstack from "@/markdown/techstack.mdx";

export default async function AboutPage() {
  const cookieStore = await cookies();
  const hasIdentity = cookieStore.has("identity");
  return (
    <>
      <main className={`main ${hasIdentity ? "main-drawer" : null}`}>
        <div className={`center`}>
          <div className={`page-title`}>
            <h1>
              About the{" "}
              <span className={`highlight`}>
                <strong>deslauriers.world</strong>
              </span>{" "}
              site:
            </h1>
          </div>
          <hr className="page-title" />
        </div>
        <div className={`content`}>
          <About />
        </div>

        {/* <hr className={`content-divider`} /> */}

        <div className={`content`} style={{ marginTop: "2rem" }}>
          <h1>The Current Tech Stack:</h1>
          <hr className="page-title" />
          <Techstack />
        </div>
      </main>
    </>
  );
}
