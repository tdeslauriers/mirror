/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { ImageData } from "@/app/images";
import styles from "./image.module.css";
import logoFallback from "@/assets/logo_world_2_512.png";

export default function Image({
  alt,
  imageData,
  sizes,
}: {
  alt?: string;
  imageData: ImageData | null;
  sizes?: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  // must sort the src set because retrieve from gateway in random order
  const sorted = useMemo(() => {
    const urls = imageData?.image_targets ?? [];
    return [...urls].sort((a, b) => a.width - b.width);
  }, [imageData?.image_targets]);

  // build the srcSet string for the img tag
  const srcSet = sorted.map((s) => `${s.signed_url} ${s.width}w`).join(", ");

  // set up a fallback image (now the largest resolution from sort) for
  // browsers that do not support srcSet
  const fallback = sorted.at(-1)?.signed_url ?? "";

  // no image data at all -> fall back to the site logo
  if (!fallback || !imageData?.width || !imageData?.height) {
    return (
      <div className={styles.imagecontainer} style={{ paddingTop: ".5rem" }}>
        <h2>No Image Available</h2>
        <img
          className={styles.image}
          alt={alt ?? "des Lauriers World logo"}
          src={logoFallback.src}
          width={logoFallback.width}
          height={logoFallback.height}
          loading="eager"
          decoding="async"
        />
      </div>
    );
  }

  return (
    <>
      <div className={styles.imagecontainer}>
        {imageData?.blur_url && (
          <div
            className={styles.placeholder}
            style={{
              backgroundImage: `url(${imageData.blur_url})`,
              opacity: isLoaded ? 0 : 1,
            }}
          />
        )}
        <img
          className={styles.image}
          alt={alt}
          src={fallback}
          srcSet={srcSet}
          sizes={sizes ?? "100vw"}
          width={imageData.width}
          height={imageData.height}
          loading="eager"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    </>
  );
}
