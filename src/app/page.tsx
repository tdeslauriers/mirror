process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import Link from "next/link";
import { cookies } from "next/headers";
import Welcome from "@/components/welcome";

export default async function Home() {
  const cookieStore = await cookies();
  const hasIdentity = cookieStore.has("identity")
    ? cookieStore.get("identity")
    : null;

  return (
    <>
      <main className={`main`}>
        <div>
          <Welcome />
          <div className={`center`}>
            <p>
              Freatures our photo gallery, some art work, and I am adding to it
              all the time! The site itself is a hobby project, sort of. To find
              out more, check out the{" "}
              <Link className={"locallink"} href={"/about"}>
                about
              </Link>{" "}
              page.
              {hasIdentity ? null : (
                <>
                  <br />
                  <br />
                  For most content, you will need to{" "}
                  <Link className={"locallink"} href={"/register"}>
                    create an account
                  </Link>
                  . If you already have one,{" "}
                  <Link className={"locallink"} href={"/login"}>
                    login
                  </Link>
                  !
                </>
              )}
            </p>
          </div>
          <p style={{ fontStyle: "italic" }}>
            Designed, deployed, and administered by{" "}
            <span className={"highlight"}>Tom des Lauriers</span>.
          </p>
        </div>
      </main>
    </>
  );
}
