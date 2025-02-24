import { cookies } from "next/headers";
import Link from "next/link";

export default async function Welcome() {
  const cookieStore = await cookies();

  const hasIdenity = cookieStore.has("identity")
    ? cookieStore.get("identity")
    : null;

  let bannerName: string = "";
  if (hasIdenity) {
    const user = JSON.parse(hasIdenity.value);
    if (user) {
      if (user.given_name) {
        bannerName = user.given_name;
      } else if (user.fullname) {
        bannerName = user.fullname;
      } else {
        bannerName = user.username;
      }
    }
  }

  return (
    <>
      <h1>
        Welcome to{" "}
        <span className={`highlight`}>
          <strong>des Lauriers</strong>
        </span>
        {bannerName.length > 0 ? (
          <>
            {" "}
            world,{" "}
            <Link className={`locallink`} href={`/profile`}>
              {bannerName}!
            </Link>
          </>
        ) : (
          " world!"
        )}
      </h1>
    </>
  );
}
