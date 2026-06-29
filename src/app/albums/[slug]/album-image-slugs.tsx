"use client";

import { useEffect } from "react";

export default function AlbumImageSlugs({
  imageSlugs,
}: {
  imageSlugs: (string | undefined)[] | null | undefined;
}) {
  useEffect(() => {
    if (imageSlugs && imageSlugs.length > 0) {
      // store the image slugs in session storage for prev-next nav
      sessionStorage.setItem(`albumNav`, JSON.stringify(imageSlugs));
    } else {
      console.log("No image slugs found.");
    }
  });

  return null;
}
