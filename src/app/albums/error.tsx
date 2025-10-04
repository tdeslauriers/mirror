"use client";

import ErrorLoadPage from "@/components/errors/error-load-page";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <ErrorLoadPage
        errBanner={"We're ded 💀, it's over."}
        errMsg={error.message}
        redirectUrl={""}
      />
    </>
  );
}
