import { getAuthCookies } from "@/components/checkCookies";
import GetCsrf from "@/components/csrf-token";
import Loading from "@/components/loading";
import { Suspense } from "react";
import UploadForm from "./upload-form";
import callGatewayData from "@/components/call-gateway-data";
import { Album } from "@/app/albums";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load add-image page: ";

export default async function AddImagePage() {
  // quick check for redirect if auth'd cookies not present
  const cookies = await getAuthCookies("/images/add");

  // check if identity cookie has images_write permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.identity || !cookies.identity.ux_render?.gallery?.image_write) {
    console.log(pageError + "User does not have images_write permission.");
    throw new Error(pageError + "You do not have permission to add images.");
  }

  // get csrf token from gateway for profile form
  const csrf = await GetCsrf(cookies.session ? cookies.session : "");

  if (!csrf) {
    console.log(
      pageError + "CSRF token could not be retrieved for add-image form."
    );
    throw new Error(
      pageError + "CSRF token could not be retrieved  add-image form."
    );
  }

  // get albums data from gateway
  // this is used to render the albums dropdown in the form
  const albums: Album[] = await callGatewayData({
    endpoint: "/albums",
    session: cookies.session,
  });

  // get permissions menu items -> gallery permissions only
  // this is used to render the permissions dropdown in the form
  const galleryPermissions = await callGatewayData({
    endpoint: "/images/permissions",
    session: cookies.session,
  });

  return (
    <>
      <main className="main main-drawer">
        <div className="center"></div>
        <h1 className="page-title">Upload Image/Photo</h1>
        <hr className={`page-title`} />
        <div className="banner">
          This form adds the photo to staging. Behind the scenes it will be
          picked up by the image processing pipeline to have thumbnails created
          and exif data persisted.
        </div>

        <Suspense fallback={<Loading />}>
          <div>
            <UploadForm
              csrf={csrf}
              albums={albums}
              permissions={galleryPermissions}
            />
          </div>
        </Suspense>
      </main>
    </>
  );
}
