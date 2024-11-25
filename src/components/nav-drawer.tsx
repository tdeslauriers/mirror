import { cookies } from "next/headers";
import style from "./nav-drawer.module.css";

export default async function NavDrawer() {
  const cookieStore = await cookies();
  const hasIdentity = cookieStore.has("identity")
    ? cookieStore.get("identity")
    : null;
  return (
    <>
      <div className={`${style.drawer} ${style.drawer2}`}>
        <div>User Administration</div>
        <div className={style.flex}>Blog</div>
        <div>Allowance</div>
        <div>Gallery</div>
      </div>
    </>
  );
}
