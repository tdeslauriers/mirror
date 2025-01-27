"use client";

import ErrorLoadPage from "@/components/errors/error-load-page";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  let errMsg = "";
  if (error.message === "forbidden" || error.message === "unauthorized") {
    errMsg = `${error.message.toUpperCase()}: you do not have permission to view the /users page.`;
  } else {
    errMsg = error.message;
  }

  return (
    <>
      <ErrorLoadPage errMsg={errMsg} redirectUrl={""} />
    </>
  );
}
