"use client";

import AuthError from "@/components/error-Authentication";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <AuthError />
    </>
  );
}
