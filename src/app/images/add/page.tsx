import { getAuthCookies } from "@/components/checkCookies";
import GetCsrf from "@/components/csrf-token";
import Loading from "@/components/loading";
import { Suspense } from "react";
import UploadForm from "./upload-form";
import callGatewayData from "@/components/call-gateway-data";
import { Album, albumComparator } from "@/app/albums";
import handlePageLoadFailure from "@/components/errors/handle-page-load-errors";
import { Permission } from "@/app/permissions";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load add-image page";

export default async function AddImagePage() {
  // quick check for redirect if auth'd cookies not present
  const cookies = await getAuthCookies("/images/add");
  if (!cookies.ok) {
    console.log(
      `${pageError} due to failed auth cookie check: ${
        cookies.error ? cookies.error.message : "unknown error"
      }`
    );
    return handlePageLoadFailure(
      401,
      cookies.error
        ? cookies.error.message
        : "unknown error related to session cookies.",
      "/login"
    );
  }

  // check if identity cookie has images_write permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.data.identity?.ux_render?.gallery?.image_write) {
    console.log(
      `${pageError}: user ${cookies.data.identity?.username} does not have rights to add an image.`
    );
    return handlePageLoadFailure(
      401,
      "You do not have rights to add an image."
    );
  }

  // get csrf, albums, and image permissions data from gateway
  const [csrfResult, albumsResult, permissionsResult] = await Promise.all([
    GetCsrf(cookies.data.session ?? ""),
    callGatewayData<Album[]>({
      endpoint: "/albums",
      session: cookies.data.session,
    }),
    callGatewayData<Permission[]>({
      endpoint: "/images/permissions",
      session: cookies.data.session,
    }),
  ]);

  if (!csrfResult.ok) {
    console.log(
      `${pageError} for user ${cookies.data.identity?.username}: ${csrfResult.error.message}`
    );
    return handlePageLoadFailure(
      csrfResult.error.code,
      csrfResult.error.message,
      "/albums"
    );
  }
  const csrf = csrfResult.data.csrf_token;

  if (!albumsResult.ok) {
    console.log(
      `${pageError} for user ${cookies.data.identity?.username}: ${albumsResult.error.message}`
    );
    return handlePageLoadFailure(
      albumsResult.error.code,
      albumsResult.error.message,
      "/albums"
    );
  }
  const sortedAlbums = [...(albumsResult.data ?? [])].sort(albumComparator);

  if (!permissionsResult.ok) {
    console.log(
      `${pageError} for user ${cookies.data.identity?.username}: ${permissionsResult.error.message}`
    );
    return handlePageLoadFailure(
      permissionsResult.error.code,
      permissionsResult.error.message,
      "/albums"
    );
  }
  const galleryPermissions = permissionsResult.data ?? [];

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
              albums={sortedAlbums}
              permissions={galleryPermissions}
            />
          </div>
        </Suspense>
      </main>
    </>
  );
}
