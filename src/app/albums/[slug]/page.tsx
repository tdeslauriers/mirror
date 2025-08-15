import { getAuthCookies } from "@/components/checkCookies";
import { Album } from "..";
import callGatewayData from "@/components/call-gateway-data";
import GetCsrf from "@/components/csrf-token";
import Tile from "@/components/tile";
import AlbumDisplay from "./album-display";
import { handleAlbumUpdate } from "./actions";
import { headers } from "next/headers";
import ClipboardButton from "@/components/clipboard-button";
import Link from "next/link";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load /album/slug page: ";

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // get slug param from url
  const slug = (await params).slug;

  // quick check for auth
  const cookies = await getAuthCookies(`/albums/${slug}`);

  // quick check if identity cookie has album_read access
  if (!cookies.identity || !cookies.identity.ux_render?.gallery?.album_read) {
    console.log(pageError + "user does not have rights to view this album.");
    throw new Error(pageError + "you do not have rights to view this album.");
  }

  // get the header data to build up the copy link for sharing
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const baseUrl = `${proto}://${host}`;

  // get album data from gateway
  const album: Album = await callGatewayData({
    endpoint: `/albums/${slug}`,
    session: cookies.session,
  });
  if (!album) {
    throw new Error("Album not found or you do not have access to it.");
  }

  // check if identity cookie has album_write permission and get csrf if so for album form
  const editAllowed = cookies.identity.ux_render?.gallery?.album_write;

  // if edit is allowed, fetch the CSRF token for the form
  let csrf: string | null = null;
  if (editAllowed) {
    // get csrf token from gateway for album form
    csrf = await GetCsrf(cookies.session ? cookies.session : "");

    if (!csrf) {
      console.log(
        pageError + "CSRF token could not be retrieved for album form."
      );
      throw new Error(
        pageError + "CSRF token could not be retrieved for album form."
      );
    }
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

            {/* link to albums table */}
            <Link href={`/albums`}>
              <button>Albums List</button>
            </Link>
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
        <div className="grid">
          {album.images && album.images.length > 0 ? (
            album.images.map((image) => (
              <>
                {image.id ? (
                  <Tile
                    key={image.slug}
                    title={image.title ? image.title : "Untitled Image"}
                    link={image.slug ? `/images/${image.slug}` : ""}
                    signed_url={image.signed_url}
                  />
                ) : (
                  <p className={`${"placeholder"} `}>
                    <span className="highlight-info">
                      There are no images/pictures in this album.
                    </span>
                  </p>
                )}
              </>
            ))
          ) : (
            <p>
              <span className="highlight-info">
                There are no images/pictures in this album.
              </span>
            </p>
          )}
        </div>
      </main>
    </>
  );
}
