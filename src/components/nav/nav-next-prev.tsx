"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getSafeReturnParams, ReturnParams } from ".";

export default function NextPrevButton({
  navKey,
  direction,
}: {
  navKey: string;
  direction: "next" | "prev";
}) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [nextSlug, setNextSlug] = useState<string | undefined>(undefined);

  const router = useRouter();

  const params = useParams();
  const currentSlug = params.slug as string;

  // TODO: get rid of this
  // to rebuild the url
  const searchParams = useSearchParams();
  const target: ReturnParams = useMemo(
    () => getSafeReturnParams(searchParams),
    [searchParams],
  );

  useEffect(() => {
    const raw = sessionStorage.getItem(navKey);
    if (!raw) return;

    let slugs: string[];
    try {
      slugs = JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse albumNav from sessionStorage:", e);
      return;
    }

    if (!Array.isArray(slugs) || slugs.length === 0) return;

    // handle single image case
    if (slugs.length === 1) {
      setIsAvailable(false);
      setIsDisabled(true);
      return;
    }

    const i = slugs.indexOf(currentSlug);

    // next button logic
    if (direction === "next") {
      if (i === -1 || i >= slugs.length - 1) {
        setIsAvailable(true); // so you can see the button
        setIsDisabled(true);
      } else {
        setIsAvailable(true);
        setIsDisabled(false);
        setNextSlug(slugs[i + 1]);
      }
    }

    // prev button logic
    if (direction === "prev") {
      if (i <= 0) {
        setIsAvailable(true); // so you can see the button
        setIsDisabled(true);
      } else {
        setIsAvailable(true);
        setIsDisabled(false);
        setNextSlug(slugs[i - 1]);
      }
    }
  }, [currentSlug, navKey, direction]);

  const handleClick = () => {
    if (nextSlug) {
      router.push(
        `/images/${nextSlug}?returnUrl=${encodeURIComponent(
          target.returnUrl,
        )}&returnDestination=${encodeURIComponent(target.returnDestination)}`,
      );
    }
  };

  return (
    <>
      {isAvailable && (
        <button onClick={handleClick} disabled={isDisabled}>
          {direction}
        </button>
      )}
    </>
  );
}
