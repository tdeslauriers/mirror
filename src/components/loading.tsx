import Image from "next/image";
import logo from "@/assets/logo_world_2.png";
import style from "./loading.module.css";

export default async function Loading() {
  return (
    <main className={`main`}>
      <Image className={style.loading} src={logo} alt="Laurels Logo" />
      <h2 className={style.banner}>Loading...</h2>
    </main>
  );
}
