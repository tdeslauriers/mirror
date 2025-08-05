import { getAuthCookies } from "@/components/checkCookies";
import Link from "next/link";

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
          To navigate to a specific album record, click on the album below:
        </div>

        
      </main>
    </>
  );
}
