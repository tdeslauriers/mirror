import { Suspense } from "react";
import Callback from "./callback";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Loading from "@/components/loading";

export const metadata = {
  robots: "noindex, nofollow",
};

export default async function CallbackPage() {
  // quick redirect if auth'd cookies are present:
  // only unauthenticated users should be be able to be redirected/see the callback page
  // TODO: (replace lightweight cookie check) validate if session is auth'd at server layer, and active, redirect if so
  // light weight cookie check if the user has authenticated cookies and redirect to "/" if true
  const cookieStore = await cookies();
  const hasIdentity = cookieStore.has("identity");

  if (hasIdentity) {
    return redirect("/");
  }

  return (
    <>
      <Suspense fallback={<Loading />}>
        <Callback />
      </Suspense>
    </>
  );
}
