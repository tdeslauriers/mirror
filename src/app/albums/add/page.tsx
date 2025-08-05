import { getAuthCookies } from "@/components/checkCookies";
import GetCsrf from "@/components/csrf-token";
import AlbumForm from "@/components/forms/album-form";
import Loading from "@/components/loading";
import { Suspense } from "react";
import { handleAlbumAdd } from "./actions";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load album add page: ";

export default async function AlbumAddPage() {
  // quick check for auth
  const cookies = await getAuthCookies("albums/add");

  // quick read of cookies
  if (!cookies.identity || !cookies.identity.ux_render?.gallery?.album_write) {
    console.log(pageError + "user does not have rights to add an album.");
    throw new Error(pageError + "you do not have rights to add an album");
  }

  // fetch csrf from gateway for add album form
  const csrf = await GetCsrf(cookies.session ? cookies.session : "");
  if (!csrf) {
    console.log(
      pageError + "CSRF token could not be retrieved for album form."
    );
    throw new Error(
      pageError + "CSRF token could not be retrieved for album form."
    );
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
            <h1>
              Album: <span className="highlight">add</span>
            </h1>
          </div>
        </div>
        <hr className={`page-title`} />

        {/* banner */}

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
