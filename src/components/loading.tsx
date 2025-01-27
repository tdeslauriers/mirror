import Image from "next/image";
import logo512 from "@/assets/logo_world_2_512.png";
import style from "./loading.module.css";

export default async function Loading() {
  return (
    <main className={`main`}>
      <div className="center"></div>
      <Image className={style.loading} src={logo512} alt="Laurels Logo" />
      <h2 className={style.banner}>Loading...</h2>
    </main>
  );
}
