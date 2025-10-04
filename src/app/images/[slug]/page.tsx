import callGatewayData from "@/components/call-gateway-data";
import { getAuthCookies } from "@/components/checkCookies";
import ImageDisplay from "./image-display";
import GetCsrf, { CsrfToken } from "@/components/csrf-token";
import { imageFormUpdate } from "./actions";
import ClipboardButton from "@/components/clipboard-button";
import { headers } from "next/headers";
import { Album, albumComparator } from "@/app/albums";
import { Permission } from "@/app/permissions";
import BackButton from "@/components/nav/back";
import handlePageLoadFailure from "@/components/errors/handle-page-load-errors";
import { ImageData } from "..";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load image record page";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // get slug param from url
  const slug = (await params).slug;

  // quick check for redirect if auth'd cookies not present
  const cookies = await getAuthCookies(`/images/${slug}`);

  // check if identity cookie has scopes_read permission
  // ie, gaurd pattern or access hint gating
  if (!cookies.identity || !cookies.identity.ux_render?.gallery?.image_read) {
    console.log(
      `${pageError}: user ${cookies.identity?.username} does not have rights to view this image.`
    );
    return handlePageLoadFailure(
      401,
      `you do not have rights to view /images/${slug}.`,
      "/albums"
    );
  }

  // get the header data to build up the copy link for sharing
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const baseUrl = `${proto}://${host}`;

  // get image record data from gateway
  const imgResult = await callGatewayData<ImageData>({
    endpoint: `/images/${slug}`,
    session: cookies.session,
  });
  if (!imgResult.ok) {
    console.log(
      `${pageError} for user ${cookies.identity?.username}: ${imgResult.error.message}`
    );
    return handlePageLoadFailure(
      imgResult.error.code,
      imgResult.error.message,
      "/albums"
    );
  }
  const imageData = imgResult.data;

  // check if identity cookie has images_write permission and get csrf if so for image form
  const editAllowed = cookies.identity.ux_render?.gallery?.image_write;

  // if edit is allowed, fetch the CSRF token for the form
  let csrf: string | null = null;
  let menuAlbums: Album[] = [];
  let menuPermissions: Permission[] = [];
  if (editAllowed) {
    // get csrf token, albums and permissions (for menus) from gateway for image form
    const [csrfResult, albumsResult, permissionsResult] = await Promise.all([
      GetCsrf(cookies.session ? cookies.session : ""),
      callGatewayData<Album[]>({
        endpoint: "/albums",
        session: cookies.session,
      }),
      callGatewayData<Permission[]>({
        endpoint: "/images/permissions",
        session: cookies.session,
      }),
    ]);

    if (!csrfResult.ok) {
      console.log(
        `${pageError} for user ${cookies.identity?.username}: ${csrfResult.error.message}`
      );
      return handlePageLoadFailure(
        csrfResult.error.code,
        csrfResult.error.message,
        `/images/${slug}`
      );
    }
    csrf = csrfResult.data.csrf_token;

    if (!albumsResult.ok) {
      console.log(
        `Error returned from gateway fetching menu albums for user ${cookies.identity?.username}: ${albumsResult.error.message}`
      );
      return handlePageLoadFailure(
        albumsResult.error.code,
        albumsResult.error.message,
        `/albums`
      );
    }
    const sortedAlbums = [...(albumsResult.data ?? [])].sort(albumComparator);
    menuAlbums = sortedAlbums;

    if (!permissionsResult.ok) {
      console.log(
        `Error returned from gateway fetching menu permissions for user ${cookies.identity?.username}: ${permissionsResult.error.message}`
      );
      return handlePageLoadFailure(
        permissionsResult.error.code,
        permissionsResult.error.message,
        `/albums`
      );
    }
    menuPermissions = permissionsResult.data ?? [];
  }

  return (
    <>
      <main className="main main-drawer">
        <div className="center"></div>
        <div className="page-title">
          <div
            className="actions"
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingRight: "1rem",
            }}
          >
            {/* share image - copy link button */}
            <ClipboardButton
              text={imageData ? `${baseUrl}/images/${slug}` : "Image"}
              label={imageData ? `'${imageData.title}'` : "Image"}
            />

            {/* back button */}
            {/* setting it to albums generically since cant know what access is */}
            <BackButton fallback="/albums" destination="albums" />
          </div>
        </div>
        <hr className="page-title" />

        {/* Display the image data */}
        <ImageDisplay
          csrf={csrf}
          editAllowed={editAllowed}
          slug={slug}
          imageData={imageData}
          menuAlbums={menuAlbums}
          menuPermissions={menuPermissions}
          imageFormUpdate={imageFormUpdate}
        />
      </main>
    </>
  );
}
