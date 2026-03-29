"use client";

import Image from "next/image";
import logo512 from "@/assets/logo_world_2_512.png";
import style from "./loading.module.css";

export default function Loading() {
  const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
  const hasIdentity = cookies.some((cookie) => cookie.startsWith("identity="));

  return (
    <>
      <main className={`main ${hasIdentity ? "main-drawer" : null}`}>
        <div className="center"></div>
        <div>
          <Image className={style.loading} src={logo512} alt="Laurels Logo" />
        </div>
        <div>
          <h2 className={style.banner}>Loading...</h2>
        </div>
      </main>
    </>
  );
}
