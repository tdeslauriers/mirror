"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { getSafeReturnParams, ReturnParams } from ".";
import { useMemo, useState } from "react";

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

  const target: ReturnParams = useMemo(
    () => getSafeReturnParams(params, fallback, destination),
    [params, fallback, destination],
  );

  const handleBack = () => {
    router.push(target.returnUrl);
  };
  return (
    (canGoBack || target.returnUrl !== "/") && (
      <div className={`actions`} style={{ width: "auto" }}>
        <button className="back" onClick={handleBack}>
          <strong>{`Back to ${target.returnDestination}`}</strong>
        </button>
      </div>
    )
  );
}
