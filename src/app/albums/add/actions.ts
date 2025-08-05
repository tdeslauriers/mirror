"use server";

import { checkForSessionCookie } from "@/components/checkCookies";
import { Album, AlbumActionCmd, handleAlbumErrors, validateAlbum } from "..";
import { isGatewayError } from "@/app/api";
import { redirect } from "next/navigation";

export async function handleAlbumAdd(
  previousScope: AlbumActionCmd,
  formData: FormData
) {
  // get session token
  const sessionCookie = await checkForSessionCookie();

  // extract the CSRF token from the previous state
  const csrf = previousScope.csrf;
  const slug = previousScope.slug;

  // validate CSRF token
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    throw new Error("CSRF token is missing or not well formed.");
  }

  // prepare the album data from formData
  let add: Album = {
    csrf: csrf,

    title: formData.get("title") as string,
    description: formData.get("description") as string,
    is_archived: formData.get("is_archived") === "on",
  };

  // validate the album data
  const errors = validateAlbum(add);
  if (errors && Object.keys(errors).length > 0) {
    return {
      csrf: csrf,
      album: add,
      errors: errors,
    } as AlbumActionCmd;
  }

  // send the album data to the gateway
  try {
    const response = await fetch(`${process.env.GATEWAY_SERVICE_URL}/albums`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${sessionCookie.value}`,
      },
      body: JSON.stringify(add),
    });

    if (response.ok) {
      add = await response.json();
      console.log("Album added successfully:", add);
    } else {
      const fail = await response.json();
      if (isGatewayError(fail)) {
        const errors = handleAlbumErrors(fail);
        return {
          csrf: csrf,
          album: add,
          errors: errors,
        } as AlbumActionCmd;
      } else {
        throw new Error("Failed to add album due to unhandled gateway error.");
      }
    }
  } catch (error) {
    console.error("Failed to add album:", error);
    throw new Error("Unhandled error while attempting to call the gateway.");
  }

  redirect("/albums");
}
