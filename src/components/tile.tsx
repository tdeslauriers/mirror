"use client";

import Link from "next/link";
import styles from "./tile.module.css";
import { ImageData } from "@/app/images";
import Image from "@/components/image";

type TileProps = {
  title: string;
  link: string;
  imageData: ImageData | undefined | null;
};

export default function Tile({ title, link, imageData }: TileProps) {
  return (
    <>
      <Link className={styles.tile} href={link}>
        {/* image thumbnail */}
        {imageData ? (
          <div className={styles.thumbnail}>
            <Image
              alt={imageData.title ?? "Image thumbnail"}
              imageData={imageData}
              sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
            />
          </div>
        ) : (
          <div className={styles.thumbnail}>
            <div>
              <span className="highlight-info">No Tile Image Available</span>
            </div>
          </div>
        )}

        <div className={`${styles.title} locallink`}>{title}</div>
      </Link>
    </>
  );
}
