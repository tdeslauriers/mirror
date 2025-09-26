"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { getSafeReturnParams, ReturnParams } from ".";
import { useEffect, useMemo, useState } from "react";

export default function BackButton({
  fallback,
  destination,
}: {
  fallback?: string;
  destination?: string;
}) {
  const [canGoBack, setCanGoBack] = useState(false);

  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    // compute after mount to avoid ssr "window" access
    if (typeof window !== "undefined") {
      setCanGoBack(window.history.length > 1);
    }
  }, []);

  const target: ReturnParams = useMemo(
    () => getSafeReturnParams(params, fallback, destination),
    [params, fallback, destination]
  );

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(target.returnUrl);
    }
  };
  return (
    <>
      <div className={`actions`} style={{ width: "auto" }}>
        <button className="back" onClick={handleBack} disabled={!canGoBack}>
          <strong>{`Back to ${target.returnDestination}`}</strong>
        </button>
      </div>
    </>
  );
}
