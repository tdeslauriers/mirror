import callGatewayData from "@/components/call-gateway-data";
import { getAuthCookies } from "@/components/checkCookies";
import Link from "next/link";
import ImageDisplay from "./image-display";
import GetCsrf from "@/components/csrf-token";
import { imageFormUpdate } from "./actions";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load image record page: ";

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
  if (!cookies.identity || !cookies.identity.ux_render?.users?.scope_read) {
    console.log(pageError + "User does not have images_read permission.");
    throw new Error(pageError + "You do not have permission to view scopes.");
  }

  const imageData = await callGatewayData({
    endpoint: `/images/${slug}`,
    session: cookies.session,
  });

  // check if identity cookie has images_write permission and get csrf if so for image form
  const editAllowed = cookies.identity.ux_render?.gallery?.image_write;

  // if edit is allowed, fetch the CSRF token for the form
  let csrf: string | null = null;
  if (editAllowed) {
    // get csrf token from gateway for scope form
    csrf = await GetCsrf(cookies.session ? cookies.session : "");

    if (!csrf) {
      console.log(
        pageError + "CSRF token could not be retrieved for scope form."
      );
      throw new Error(
        pageError + "CSRF token could not be retrieved for scope form."
      );
    }
  }

  console.log("Image data fetched successfully:", imageData);

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
            {/* title */}
            <h1>
              Link:{" "}
              <Link className="locallink" href={`/images/${slug}`}>
                {`/images/${slug}`}
              </Link>
            </h1>

            {/* link to scopes table */}
            <Link href={`/album`}>
              <button>Album Placeholder</button>
            </Link>
          </div>
        </div>
        <hr className="page-title" />

        {/* Display the image data */}
        <ImageDisplay
          csrf={csrf}
          editAllowed={editAllowed}
          slug={slug}
          imageData={imageData}
          imageFormUpdate={imageFormUpdate}
        />
      </main>
    </>
  );
}
