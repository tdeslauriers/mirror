import { getAuthCookies } from "@/components/checkCookies";
import { Album } from "..";
import callGatewayData from "@/components/call-gateway-data";
import GetCsrf from "@/components/csrf-token";
import Tile from "@/components/tile";
import AlbumDisplay from "./album-display";
import { handleAlbumUpdate } from "./actions";
import { headers } from "next/headers";
import ClipboardButton from "@/components/clipboard-button";
import styles from "../album.module.css";
import BackButton from "@/components/nav/back";
import { imageComparator } from "@/app/images";
import handlePageLoadFailure from "@/components/errors/handle-page-load-errors";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load /album/slug page";

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // get slug param from url
  const slug = (await params).slug;

  // quick check for auth
  const cookiesResult = await getAuthCookies(`/albums/${slug}`);

  // quick check if identity cookie exists
  if (!cookiesResult.ok) {
    console.log(
      `${pageError}: failed auth cookie check: ${
        cookiesResult.error ? cookiesResult.error.message : "unknown error"
      }`
    );
    return handlePageLoadFailure(401, cookiesResult.error.message, "/login");
  }

  // check if user has album read rights
  if (!cookiesResult.data.identity?.ux_render?.gallery?.album_read) {
    console.log(
      `${pageError}: user ${
        cookiesResult.ok ? cookiesResult.data.identity?.username : null
      } does not have rights to view this album.`
    );
    return handlePageLoadFailure(
      401,
      `you do not have rights to view /albums/${slug}`,
      "/albums."
    );
  }

  // get the header data to build up the copy link for sharing
  const hdrs = await headers();
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const baseUrl = `${proto}://${host}`;

  // get album data from gateway
  const result = await callGatewayData<Album>({
    endpoint: `/albums/${slug}`,
    session: cookiesResult.data.session,
  });
  if (!result.ok) {
    console.log(
      `${pageError} for user ${cookiesResult.data.identity?.username}: ${result.error.message}`
    );
    return handlePageLoadFailure(
      result.error.code,
      result.error.message,
      "/albums"
    );
  }

  const album = result.data;

  // sort images by date and then by title
  const sortedImages = [...(album.images ?? [])].sort(imageComparator);

  // check if identity cookie has album_write permission and get csrf if so for album form
  const editAllowed =
    cookiesResult.data.identity?.ux_render?.gallery?.album_write;

  // if edit is allowed, fetch the CSRF token for the form
  let csrf: string | null = null;
  if (editAllowed) {
    // get csrf token from gateway for album form
    const result = await GetCsrf(cookiesResult.data.session ?? "");
    if (!result.ok) {
      console.log(
        `${pageError} for user ${cookiesResult.data.identity?.username}: ${result.error.message}`
      );
      return handlePageLoadFailure(500, result.error.message, "/albums");
    }

    // set the csrf token for the album form
    csrf = result.data.csrf_token;
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
            {/* share album - copy link button */}
            <ClipboardButton
              text={album ? `${baseUrl}/albums/${slug}` : "Album"}
              label={album ? `'${album.title}'` : "Album"}
            />

            {/* back button */}
            <BackButton destination="albums" fallback="/albums" />
          </div>
        </div>
        <hr className={`page-title`} />

        {/* Album Description */}
        <AlbumDisplay
          csrf={csrf}
          editAllowed={editAllowed}
          slug={slug}
          albumData={album}
          albumFormUpdate={handleAlbumUpdate}
        />

        {/* images: display the thumbnail images of an album in a grid */}
        <div className={styles.tiledisplay}>
          {sortedImages &&
            sortedImages.length > 0 &&
            sortedImages.map((image) => (
              <>
                {image.id ? (
                  <Tile
                    key={image.slug}
                    title={image.title}
                    link={`/images/${image.slug}?returnUrl=${encodeURIComponent(
                      `/albums/${slug}`
                    )}&returnDestination=${encodeURIComponent(
                      album.title ?? "album"
                    )}`}
                    imageData={image}
                  />
                ) : (
                  <p>
                    <span className="highlight-error">Empty image record.</span>
                  </p>
                )}
              </>
            ))}
          {(!album.images || album.images.length <= 0) && (
            <p>
              <span className="highlight-info">
                No images found in this album.
              </span>
            </p>
          )}
        </div>
      </main>
    </>
  );
}
