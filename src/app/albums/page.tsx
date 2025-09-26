import callGatewayData from "@/components/call-gateway-data";
import { getAuthCookies } from "@/components/checkCookies";
import Link from "next/link";
import { Album } from ".";
import Tile from "@/components/tile";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load /albums page: ";

export default async function AlbumsPage() {
  // quick check for auth
  const cookies = await getAuthCookies("/albums");

  // quick check if identity cookie has album_read access
  if (!cookies.identity || !cookies.identity.ux_render?.gallery?.album_read) {
    console.log(pageError + "user does not have rights to view albums.");
    throw new Error(pageError + "you do not have rights to view albums.");
  }

  // get albums data from gateway
  const albums: Album[] = await callGatewayData({
    endpoint: "/albums",
    session: cookies.session,
  });
  if (!albums || albums.length === 0) {
    // TODO: fix digest error here
    // throw new Error(
    //   "It appears you have not been granted access to any albums and/or photos yet."
    // );
    console.log(pageError + "no albums data returned from gateway.");
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
            <h1>Albums</h1>
            {cookies.identity?.ux_render?.gallery?.album_write && (
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
          {albums && albums.length > 0 ? (
            albums.map((album) => (
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
