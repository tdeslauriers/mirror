"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { getSafeReturnParams, ReturnParams } from ".";

export default function BackButton({
  fallback,
  destination,
}: {
  fallback?: string;
  destination?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const target: ReturnParams = getSafeReturnParams(
    params,
    fallback ?? fallback,
    destination ?? destination
  );

  console.log("BackButton target:", target);

  const handleBack = () => {

    router.push(target.returnUrl);
  };

  return (
    <>
      <div className={`actions`} style={{ width: "auto" }}>
        <button
          className="back"
          onClick={handleBack}
          disabled={window.history.length < 1}
        >
          <strong>{`Back to ${target.returnDestination}`}</strong>
        </button>
      </div>
    </>
  );
}
