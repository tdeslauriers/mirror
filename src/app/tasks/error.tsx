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
  if (error.message === "forbidden") {
    // get search params from URL if they exist
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;
    const query = searchParams.toString();
    const fullpath = `/tasks${query ? `?${query}` : ""}`;

    errMsg = `${error.message.toUpperCase()}: you do not have permission to view ${fullpath}.`;
  } else {
    errMsg = error.message;
  }

  return (
    <>
      <ErrorLoadPage errMsg={errMsg} redirectUrl={"/tasks"} />
    </>
  );
}
