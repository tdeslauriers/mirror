/* eslint-disable @next/next/no-img-element */
"use client";

import { ImageData } from "@/app/images";

import styles from "./image.module.css";
import { useMemo, useState } from "react";

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

  // set up a fallback image if no image data or signed url
  const fallback = sorted.at(-1)?.signed_url ?? "";

  // check for empty/null image data
  if (!fallback || !imageData?.width || !imageData?.height) {
    return null;
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
