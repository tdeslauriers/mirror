"use client";

import ErrorGeneral from "@/components/error-general";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <ErrorGeneral error={error} reset={reset} />
    </>
  );
}
