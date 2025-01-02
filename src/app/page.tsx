// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
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
      <main className={`main ${hasIdentity ? "main-drawer" : null}`}>
        <div>
          <Welcome />
          <div className={`center`}>
            <div className={`content`}>
              <p>
                This site is my personal passion project, featuring a growing
                photo gallery and some of my artwork. It is in continuous flux
                because I&apos;m always adding new content, improving the
                services, and refining the user experience. To learn more about
                the site&apos;s development, check out the{" "}
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
                    . If you already have account,{" "}
                    <Link className={"locallink"} href={"/login"}>
                      login
                    </Link>
                    !
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
