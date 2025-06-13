import callGatewayData from "@/components/call-gateway-data";
import { getAuthCookies } from "@/components/checkCookies";
import Image from "next/image";
import styles from "../image.module.css";

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
            <h1>Picture Title</h1>
          </div>
        </div>
        <hr className="page-title" />

        {imageData && imageData?.image_date && (
          <div className="banner">
            {new Date(imageData.image_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        )}

        <div className={styles.content}>
          <div className={styles.imagecard}>
            <Image
              src={imageData.signed_url}
              alt={""}
              width={1000}
              height={1000}
              className={styles.image}
            />
          </div>
        </div>
      </main>
    </>
  );
}
