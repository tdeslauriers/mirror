"use client";

import ErrorLoadPage from "@/components/errors/error-load-page";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <ErrorLoadPage errMsg={error.message} redirectUrl={"/login"} />
    </>
  );
}
