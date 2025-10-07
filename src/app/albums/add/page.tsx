import { getAuthCookies } from "@/components/checkCookies";
import GetCsrf from "@/components/csrf-token";
import AlbumForm from "@/components/forms/album-form";
import Loading from "@/components/loading";
import { Suspense } from "react";
import { handleAlbumAdd } from "./actions";
import handlePageLoadFailure from "@/components/errors/handle-page-load-errors";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load album add page ";

export default async function AlbumAddPage() {
  // quick check for auth
  const cookies = await getAuthCookies("albums/add");
  // return auth error page if cookies are not valid
  if (!cookies.ok) {
    console.log(
      `${pageError}: failed auth cookie check: ${
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

  // quick read of cookies
  if (!cookies.data.identity?.ux_render?.gallery?.album_write) {
    console.log(
      `${pageError} for user ${cookies.data.identity?.username} does not have rights to add an album.`
    );
    return handlePageLoadFailure(
      401,
      "You do not have rights to add an album.",
      "/albums"
    );
  }

  // get csrf token from gateway for album form
  const result = await GetCsrf(cookies.data.session ?? "");
  if (!result.ok) {
    console.log(
      `${pageError} for user ${cookies.data.identity?.username}: ${result.error.message}`
    );
    return handlePageLoadFailure(500, result.error.message, "/albums");
  }
  const csrf = result.data.csrf_token;

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
            <h1>
              Album: <span className="highlight">add</span>
            </h1>
          </div>
        </div>
        <hr className={`page-title`} />

        {/* banner */}
        <div className="banner">
          <ul>
            <li>
              Albums are collections of images, used to organize and display
              pictures in a structured way.
            </li>
            <li>Images may be associated with more than one album.</li>
            <li>
              <span className="highlight-info">Note:</span> Albums themselves do
              not have any permissions associated with them, that is assigned
              image by image.
            </li>
          </ul>
        </div>

        <div className="card-title">
          <h2>Add Album</h2>
        </div>
        <Suspense fallback={<Loading />}>
          <div className="card">
            <AlbumForm
              csrf={csrf}
              slug={null}
              album={null}
              handleAlbumForm={handleAlbumAdd}
            />
          </div>
        </Suspense>
      </main>
    </>
  );
}
