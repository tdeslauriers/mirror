"use client";

import ErrorLoadPage from "@/components/error-load-page";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <ErrorLoadPage error={error.message} redirectUrl={"/login"} />
    </>
  );
}
