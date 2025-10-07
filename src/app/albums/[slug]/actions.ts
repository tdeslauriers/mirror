"use server";

import { getAuthCookies } from "@/components/checkCookies";
import { Album, AlbumActionCmd, handleAlbumErrors, validateAlbum } from "..";
import { isGatewayError } from "@/app/api";
import { redirect } from "next/navigation";

export async function handleAlbumUpdate(
  perviousState: AlbumActionCmd,
  formData: FormData
) {
  // extract the CSRF token from the previous state
  const csrf = perviousState.csrf;

  // get slug from previous state
  const slug = perviousState.slug;

  // prepare the album data from formDatal
  let updated: Album = {
    csrf: csrf,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    slug: slug ?? "", // ensure slug is included
    is_archived: formData.get("is_archived") === "on",
  };

  // get session token
  const cookieResult = await getAuthCookies(`/albums/${slug}`);
  if (!cookieResult.ok) {
    console.error(
      `failed to get auth cookies for user attempting to update album ${slug}: ${
        cookieResult.error ? cookieResult.error.message : "unknown error"
      }`
    );
    return {
      csrf: csrf,
      slug: slug,
      album: updated,
      errors: {
        server: [
          `Failed to verify authentication cookies. Please login again and try to update the album.`,
        ],
      },
    } as AlbumActionCmd;
  }

  // validate CSRF token
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    console.error(
      `user ${cookieResult.data.identity?.username} submitted CSRF token which is missing or not well formed.`
    );
    return {
      csrf: csrf,
      slug: slug,
      album: updated,
      errors: {
        csrf: [
          "CSRF token is missing or not well formed.  This value is required and cannot be tampered with.",
        ],
      },
    } as AlbumActionCmd;
  }

  // validate slug
  if (!slug || slug.trim().length < 16 || slug.trim().length > 64) {
    console.error(
      `user ${cookieResult.data.identity?.username} submitted album slug which is missing or not well formed.`
    );
    return {
      csrf: csrf,
      slug: slug,
      album: updated,
      errors: {
        server: [
          "Album slug is missing or not well formed.  This value is required and cannot be tampered with.",
        ],
      },
    } as AlbumActionCmd;
  }

  // validate the album data
  const errors = validateAlbum(updated);
  if (errors && Object.keys(errors).length > 0) {
    console.error(
      `user ${
        cookieResult.data.identity?.username
      } submitted album data which failed validation: ${JSON.stringify(errors)}`
    );
    return {
      csrf: csrf,
      slug: slug,
      album: updated,
      errors: errors,
    } as AlbumActionCmd;
  }

  // send the album data to the gateway
  try {
    const response = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/albums/${slug}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${cookieResult.data.session}`,
        },
        body: JSON.stringify(updated),
      }
    );

    if (response.ok) {
      console.log(
        `user ${cookieResult.data.identity?.username} updated album ${slug} successfully.`
      );
    } else {
      const fail = await response.json();
      if (isGatewayError(fail)) {
        const errors = handleAlbumErrors(fail);
        console.error(
          `user ${
            cookieResult.data.identity?.username
          } failed to update album ${perviousState.slug}: ${JSON.stringify(
            errors
          )}`
        );
        return {
          csrf: csrf,
          slug: slug,
          album: updated,
          errors: errors,
        } as AlbumActionCmd;
      } else {
        console.error(
          `user ${cookieResult.data.identity?.username} received unexpected error while attempting to update album ${perviousState.slug}: ${response.status} ${response.statusText}`
        );
        return {
          csrf: csrf,
          slug: slug,
          album: updated,
          errors: {
            server: [
              `Received unexpected error from gateway while attempting to update album: ${response.status} ${response.statusText}`,
            ],
          },
        } as AlbumActionCmd;
      }
    }
  } catch (error) {
    console.error(
      `user ${cookieResult.data.identity?.username} failed to update album ${perviousState.slug}: ${error}`
    );
    return {
      csrf: csrf,
      slug: slug,
      album: updated,
      errors: {
        server: [
          `Failed to update album due to an internal server error. Please try again.`,
        ],
      },
    } as AlbumActionCmd;
  }

  redirect(`/albums/${slug}`);
}
