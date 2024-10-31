"use client";

export default function ErrorGeneral({
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
