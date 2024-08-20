import styles from "./welcome.module.css";
import { cookies } from "next/headers";

export default function Welcome() {
  const cookieStore = cookies();
  const hasAuthenticated = cookieStore.has("authenticated")
    ? cookieStore.get("authenticated")
    : null;
  const hasIdenity = cookieStore.has("identity")
    ? cookieStore.get("identity")
    : null;

  let bannerName: string = "";
  if (hasAuthenticated && hasAuthenticated.value === "true" && hasIdenity) {
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
      <h2>
        Welcome to{" "}
        <span className={styles.highlight}>
          <strong>des Lauriers</strong>
        </span>
        {bannerName.length > 0 ? ` world, ${bannerName}!` : " world!"}
      </h2>
    </>
  );
}
