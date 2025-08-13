"use server";

import { checkForSessionCookie } from "@/components/checkCookies";
import { Album, AlbumActionCmd, handleAlbumErrors, validateAlbum } from "..";
import { isGatewayError } from "@/app/api";
import { redirect } from "next/navigation";

export async function handleAlbumUpdate(
  perviousState: AlbumActionCmd,
  formData: FormData
) {
  // get session token
  const sessionCookie = await checkForSessionCookie();

  // extract the CSRF token from the previous state
  const csrf = perviousState.csrf;

  // validate CSRF token
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    throw new Error(
      "CSRF token is missing or not well formed.   This value is required and cannot be tampered with."
    );
  }

  // get slug from previous state
  const slug = perviousState.slug;

  // validate slug
  if (!slug || slug.trim().length < 16 || slug.trim().length > 64) {
    throw new Error(
      "Album slug is missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  // prepare the album data from formDatal
  let updated: Album = {
    csrf: csrf,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    slug: slug, // ensure slug is included
    is_archived: formData.get("is_archived") === "on",
  };

  // validate the album data
  const errors = validateAlbum(updated);
  if (errors && Object.keys(errors).length > 0) {
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
          Authorization: `${sessionCookie.value}`,
        },
        body: JSON.stringify(updated),
      }
    );

    if (response.ok) {
      console.log("Album updated successfully:", updated);
    } else {
      const fail = await response.json();
      if (isGatewayError(fail)) {
        const errors = handleAlbumErrors(fail);
        return {
          csrf: csrf,
          slug: slug,
          album: updated,
          errors: errors,
        } as AlbumActionCmd;
      } else {
        throw new Error(
          "Failed to update album due to unhandled gateway error."
        );
      }
    }
  } catch (error) {
    console.error("Failed to update album:", error);
    throw new Error("Unhandled error while attempting to call the gateway.");
  }

  console.log("Album update command: ", updated);
  // redirect to the album page after successful update
  redirect(`/albums/${slug}`);
}
