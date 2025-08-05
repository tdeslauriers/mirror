"use client";

import ErrorForm from "@/components/errors/error-form";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <ErrorForm error={error} reset={reset} />
    </>
  );
}
