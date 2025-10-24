"use server";

import { getAuthCookies, getSessionCookie } from "@/components/checkCookies";
import { ImageActionCmd, UpdateImageCmd, validateUpdateImageCmd } from "..";
import { GatewayError, isGatewayError } from "@/app/api";
import { redirect } from "next/navigation";

export async function imageFormUpdate(
  previousState: ImageActionCmd,
  formData: FormData
) {
  // load form data
  const csrf = previousState.csrf;
  const slug = previousState.slug;

  // get form date
  let updated: UpdateImageCmd = {
    csrf: csrf,

    slug: slug,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    image_date_month: parseInt(formData.get("image_date_month") as string),
    image_date_day: parseInt(formData.get("image_date_day") as string),
    image_date_year: parseInt(formData.get("image_date_year") as string),
    is_published: formData.get("is_published") === "on" ? true : false,
    is_archived: formData.get("is_archived") === "on" ? true : false,
    album_slugs: formData.getAll("albums[]") as string[],
    permission_slugs: formData.getAll("permissions[]") as string[],
  };

  // get session cookie for auth
  const cookies = await getAuthCookies(`/images/${slug}`);
  if (!cookies.ok) {
    console.log(
      `Image update failed because could not verify session cookies: ${
        cookies.error ? cookies.error.message : "unknown error"
      }`
    );
    return {
      csrf: csrf,
      slug: slug,
      updateCmd: updated,
      errors: {
        server: [
          cookies.error
            ? cookies.error.message
            : "unknown error related to session cookies.",
        ],
      },
    } as ImageActionCmd;
  }

  // light-weight validation of csrf token
  // true validation happpens in the gateway
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    console.log(
      `user ${cookies.data.identity?.username} image update failed: csrf token missing or not well formed.`
    );
    return {
      csrf: csrf,
      slug: slug,
      updateCmd: updated,
      errors: {
        csrf: [
          "CSRF token is missing or not well formed.  This value is required and cannot be tampered with.",
        ],
      },
    } as ImageActionCmd;
  }

  // light-weight validation of csrf token
  // true validation happpens in the gateway
  if (!slug || slug.trim().length < 16 || slug.trim().length > 64) {
    console.log(
      `user ${cookies.data.identity?.username} image update failed: image slug missing or not well formed.`
    );
    return {
      csrf: csrf,
      slug: slug,
      updateCmd: updated,
      errors: {
        slug: [
          "Image slug is missing or not well formed.  This value is required and cannot be tampered with.",
        ],
      },
    } as ImageActionCmd;
  }

  // validate the updated image data
  const errors = validateUpdateImageCmd(updated);
  if (Object.keys(errors).length > 0) {
    // if there are errors, return the previous state with the errors
    console.log(
      `user ${
        cookies.data.identity?.username
      } image update failed validation: ${JSON.stringify(errors)}`
    );
    return {
      csrf: csrf,
      slug: slug,
      updateCmd: updated,
      errors: errors,
    } as ImageActionCmd;
  }

  // send the update command to the gateway
  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/images/${slug}`,
      {
        method: "PUT",
        headers: {
          Content_Type: "application/json",
          Authorization: `${cookies.data.session}`,
        },
        body: JSON.stringify(updated),
      }
    );

    if (apiResponse.ok) {
      //   const success = await apiResponse.json();
      console.log(
        `image metadata updated successfully by user ${cookies.data.identity?.username}.`
      );
    } else {
      const fail = await apiResponse.json();
      console.log(
        `image metadata update failed for user ${cookies.data.identity?.username}: ${fail.message}`
      );
      if (isGatewayError(fail)) {
        const errors = handleImageUpdateErrors(fail);
        return {
          csrf: csrf,
          slug: slug,
          updateCmd: updated,
          errors: errors,
        } as ImageActionCmd;
      } else {
        console.error(
          `image ${slug} updated failed for user ${cookies.data.identity?.username} due to unhandled gateway error: ${fail.message}`
        );
        return {
          csrf: csrf,
          slug,
          updateCmd: updated,
          errors: {
            server: [
              fail.message
                ? fail.message
                : "Image update failed due to an unhandled gateway error.",
            ],
          },
        } as ImageActionCmd;
      }
    }
  } catch (error) {
    console.error(
      `image ${slug} update failed for user ${
        cookies.data.identity?.username
      } due to unhandled error: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );
    return {
      csrf: csrf,
      slug,
      updateCmd: updated,
      errors: {
        server: [
          error instanceof Error
            ? error.message
            : "Image update failed due to an unhandled error.",
        ],
      },
    } as ImageActionCmd;
  }

  redirect(`/images/${slug}`);
}

function handleImageUpdateErrors(gatewayError: GatewayError) {
  const errors: { [key: string]: string[] } = {};

  switch (gatewayError.code) {
    case 400:
      errors.server = [gatewayError.message];
      return errors;
    case 401:
      errors.server = [gatewayError.message];
    case 403:
      errors.server = [gatewayError.message];
    case 404:
      errors.server = [gatewayError.message];
    case 405:
      errors.server = [gatewayError.message];
      return errors;
    case 422:
      // temporary fix for now: determine which error received
      switch (true) {
        case gatewayError.message.includes("title"):
          errors.title = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("description"):
          errors.description = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("image date"):
          errors.image_date = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("published"):
          errors.checkboxes = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("archived"):
          errors.checkboxes = [gatewayError.message];
          return errors;
        default:
          break;
      }
    default:
      errors.server = [gatewayError.message || "Unknown error occurred."];
      return errors;
  }
}
