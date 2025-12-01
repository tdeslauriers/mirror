"use server";

import { getSessionCookie, getAuthCookies } from "@/components/checkCookies";
import { Album, AlbumActionCmd, handleAlbumErrors, validateAlbum } from "..";
import { isGatewayError } from "@/app/api";
import { redirect } from "next/navigation";

export async function handleAlbumAdd(
  previousScope: AlbumActionCmd,
  formData: FormData
) {
  // extract the CSRF token from the previous stat
  const csrf = previousScope.csrf;

  // prepare the album data from formData
  let add: Album = {
    csrf: csrf,

    title: formData.get("title") as string,
    description: formData.get("description") as string,
    is_archived: formData.get("is_archived") === "on",
  };

  // get auth cookies
  const cookies = await getAuthCookies("/albums/add");
  if (!cookies.ok) {
    console.error(
      `failed to get auth cookies for user attempting to add an album: ${
        cookies.error ? cookies.error.message : "unknown error"
      }`
    );
    return {
      csrf: csrf,
      album: add,
      errors: {
        server: [
          `Failed to verify authentication cookies. Please login again and try to add the album.`,
        ],
      },
    } as AlbumActionCmd;
  }

  // validate CSRF token
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    console.error(
      `user ${cookies.data.identity?.username} submitted CSRF token which is missing or not well formed.`
    );
    return {
      csrf: csrf,
      album: add,
      errors: {
        csrf: [
          "CSRF token is required and must be between 16 and 64 characters long.",
        ],
      },
    } as AlbumActionCmd;
  }

  // validate the album data
  const errors = validateAlbum(add);
  if (errors && Object.keys(errors).length > 0) {
    console.error(
      `user ${
        cookies.data.identity?.username
      } submitted album data which did not pass validation: ${JSON.stringify(
        errors
      )}`
    );
    return {
      csrf: csrf,
      album: add,
      errors: errors,
    } as AlbumActionCmd;
  }

  // send the album data to the gateway
  try {
    const response = await fetch(`${process.env.GATEWAY_SERVICE_URL}/albums/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${cookies.data.session}`,
      },
      body: JSON.stringify(add),
    });

    if (response.ok) {
      add = await response.json();
      console.log(
        `user ${cookies.data.identity?.username} added album ${add.title} successfully.`
      );
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
        console.error(
          `user ${
            cookies.data.identity?.username
          } received an unhandled error from the gateway when adding an album: ${JSON.stringify(
            fail
          )}`
        );
        return {
          csrf: csrf,
          album: add,
          errors: {
            server: [
              `Failed to add album due to an internal server error. Please try again.`,
            ],
          },
        } as AlbumActionCmd;
      }
    }
  } catch (error) {
    console.error(
      `user ${cookies.data.identity?.username} encountered an error when attempting to add an album: ${error}`
    );
    return {
      csrf: csrf,
      album: add,
      errors: {
        server: [
          `Failed to add album due to an internal server error. Please try again.`,
        ],
      },
    } as AlbumActionCmd;
  }

  redirect("/albums");
}
