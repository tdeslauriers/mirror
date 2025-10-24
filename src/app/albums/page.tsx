import callGatewayData from "@/components/call-gateway-data";
import { getAuthCookies } from "@/components/checkCookies";
import Link from "next/link";
import { Album, albumComparator } from ".";
import Tile from "@/components/tile";
import handlePageLoadFailure from "@/components/errors/handle-page-load-errors";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load /albums page";

export default async function AlbumsPage() {
  // quick check for auth
  const cookiesResult = await getAuthCookies("/albums");
  if (!cookiesResult.ok) {
    console.log(
      pageError +
        `failed auth cookie check: ${
          cookiesResult.error ? cookiesResult.error.message : "unknown error"
        }`
    );
    return handlePageLoadFailure(
      401,
      cookiesResult.error
        ? cookiesResult.error.message
        : "unknown error related to session cookies.",
      "/login"
    );
  }

  // quick check if identity cookie has album_read access
  if (!cookiesResult.data.identity?.ux_render?.gallery?.album_read) {
    console.log(
      `${pageError}: user ${cookiesResult.data.identity?.username} does not have rights to view /albums.`
    );
    return handlePageLoadFailure(
      401,
      `${pageError}: ${cookiesResult.data.identity?.given_name}, it appears you do not have access to view albums.`
    );
  }

  // get albums data from gateway
  const result = await callGatewayData<Album[]>({
    endpoint: "/albums",
    session: cookiesResult.data.session,
  });
  if (!result.ok) {
    console.log(
      `${pageError}.  Error returned from gateway for user ${cookiesResult.data.identity?.username}: ${result.error.message}`
    );
    return handlePageLoadFailure(result.error.code, result.error.message);
  }

  const albums = result.data;

  // log empty return -> permissions error
  if (!albums || albums.length === 0) {
    console.log(
      `No albums data returned from gateway for user: ${cookiesResult.data.identity?.username}`
    );
    return handlePageLoadFailure(
      401,
      `${pageError}: ${cookiesResult.data.identity?.given_name}, it appears you do not have access to any albums yet.`
    );
  }

  // sort albums by title (alphabetically) then by year (descending)
  const sortedAlbums = albums.sort(albumComparator);

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
            <h1>Albums</h1>
            {cookiesResult.data.identity?.ux_render?.gallery?.album_write && (
              <Link href="/albums/add">
                <button>Add Album</button>
              </Link>
            )}
          </div>
        </div>
        <hr className={`page-title`} />
        <div className="banner">
          To navigate to a specific album, click on the album tile below:
        </div>

        {/* albums: display albums in a grid */}
        <div className="grid">
          {sortedAlbums && sortedAlbums.length > 0 ? (
            sortedAlbums.map((album) => (
              <Tile
                key={album.slug}
                title={album.title ? album.title : "Untitled Album"}
                link={album.slug ? `/albums/${album.slug}` : ""}
                imageData={album?.images?.[0] ?? null}
              />
            ))
          ) : (
            <div className="content" style={{ textAlign: "center" }}>
              <p>
                <span className="highlight-error">
                  It appears you have not been granted access to any albums yet.
                </span>
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
