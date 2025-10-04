import ErrorLoadPage from "@/components/errors/error-load-page";

export default function NotFound() {
  return (
    <>
      <ErrorLoadPage
        errBanner="404 | You're off the map..."
        errMsg="Here, there be monsters."
      />
    </>
  );
}
