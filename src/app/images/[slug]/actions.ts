"use server";

import { getAuthCookies } from "@/components/checkCookies";
import {
  DeleteImageActionCmd,
  DeleteImageCmd,
  UpdateImageActionCmd,
  UpdateImageCmd,
  validateUpdateImageCmd,
} from "..";
import { GatewayError, isGatewayError } from "@/app/api";
import { redirect } from "next/navigation";
import { checkCsrf, checkSlug } from "@/validation";

export async function handleImageUpdate(
  csrf: string,
  slug: string,
  previousState: UpdateImageActionCmd,
  formData: FormData,
) {
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
      }`,
    );
    return {
      updateCmd: updated,
      errors: {
        server: [
          cookies.error
            ? cookies.error.message
            : "unknown error related to session cookies.",
        ],
      },
    } as UpdateImageActionCmd;
  }

  // check csrf
  const csrfCheck = checkCsrf(csrf);
  if (!csrfCheck.isValid) {
    console.log(
      `user ${cookies.data.identity?.username} image update failed: csrf token missing or not well formed.`,
    );
    return {
      updateCmd: updated,
      errors: {
        csrf: csrfCheck.messages,
      },
    } as UpdateImageActionCmd;
  }

  // check slug
  const slugCheck = checkSlug(slug);
  if (!slugCheck.isValid) {
    console.log(
      `user ${cookies.data.identity?.username} image update failed: image slug missing or not well formed.`,
    );
    return {
      updateCmd: updated,
      errors: {
        slug: slugCheck.messages,
      },
    } as UpdateImageActionCmd;
  }

  // validate the updated image data
  const errors = validateUpdateImageCmd(updated);
  if (Object.keys(errors).length > 0) {
    // if there are errors, return the previous state with the errors
    console.log(
      `user ${
        cookies.data.identity?.username
      } image ${slug} update failed validation: ${JSON.stringify(errors)}`,
    );
    return {
      updateCmd: updated,
      errors: errors,
    } as UpdateImageActionCmd;
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
      },
    );

    if (apiResponse.ok) {
      //   const success = await apiResponse.json();
      console.log(
        `image ${slug} metadata updated successfully by user ${cookies.data.identity?.username}.`,
      );
    } else {
      const fail = await apiResponse.json();
      console.error(
        `image ${slug} metadata update failed for user ${cookies.data.identity?.username}: ${fail.message}`,
      );
      if (isGatewayError(fail)) {
        const errors = handleImageUpdateErrors(fail);
        return {
          updateCmd: updated,
          errors: errors,
        } as UpdateImageActionCmd;
      } else {
        console.error(
          `image ${slug} updated failed for user ${cookies.data.identity?.username} due to unhandled gateway error: ${fail.message}`,
        );
        return {
          updateCmd: updated,
          errors: {
            server: [
              fail.message
                ? fail.message
                : "Image update failed due to an unhandled gateway error.",
            ],
          },
        } as UpdateImageActionCmd;
      }
    }
  } catch (error) {
    console.error(
      `image ${slug} update failed for user ${
        cookies.data.identity?.username
      } due to unhandled error: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    );
    return {
      updateCmd: updated,
      errors: {
        server: [
          error instanceof Error
            ? error.message
            : "Image update failed due to an unhandled error.",
        ],
      },
    } as UpdateImageActionCmd;
  }

  redirect(`/images/${slug}`);
}

// handles request to delete image
export async function handleImageDelete(
  csrf: string,
  slug: string,
  returnUrl: string | string[] | undefined,
  previousState: DeleteImageActionCmd,
  formData: FormData,
) {
  // prepare fields
  csrf = csrf.trim();
  slug = slug.trim();
  returnUrl = (returnUrl as string).trim();

  // get session cookie for auth
  const cookies = await getAuthCookies(`/images/${slug}`);
  if (!cookies.ok) {
    console.log(
      `Image ${slug} deletion failed because could not verify session cookies: ${
        cookies.error ? cookies.error.message : "unknown error"
      }`,
    );
    return {
      errors: {
        server: [
          cookies.error
            ? cookies.error.message
            : "unknown error related to session cookies.",
        ],
      },
    } as DeleteImageActionCmd;
  }

  // check csrf
  const csrfCheck = checkCsrf(csrf);
  if (!csrfCheck.isValid) {
    console.log(
      `user ${cookies.data.identity?.username} image ${slug} deletion failed: csrf token missing or not well formed.`,
    );
    return {
      errors: {
        csrf: csrfCheck.messages,
      },
    } as DeleteImageActionCmd;
  }

  // check slug
  const slugCheck = checkSlug(slug);
  if (!slugCheck.isValid) {
    console.log(
      `user ${cookies.data.identity?.username} image ${slug} deletion failed: image slug missing or not well formed.`,
    );
    return {
      errors: {
        slug: slugCheck.messages,
      },
    } as DeleteImageActionCmd;
  }

  // prepare command
  const cmd: DeleteImageCmd = {
    csrf: csrf,
  };

  // send the delete image command to the gateway
  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/images/${slug}`,
      {
        method: "DELETE",
        headers: {
          Content_Type: "application/json",
          Authorization: `${cookies.data.session}`,
        },
        body: JSON.stringify(cmd),
      },
    );

    if (apiResponse.ok) {
      //   const success = await apiResponse.json();
      console.log(
        `image ${slug} deleted successfully by user ${cookies.data.identity?.username}.`,
      );
    } else {
      const fail = await apiResponse.json();
      console.error(
        `image ${slug} deletion failed for user ${cookies.data.identity?.username}: ${fail.message}`,
      );
      if (isGatewayError(fail)) {
        const errors = handleImageUpdateErrors(fail);
        return {
          errors: errors,
        } as DeleteImageActionCmd;
      } else {
        console.error(
          `image ${slug} deletion failed for user ${cookies.data.identity?.username} due to unhandled gateway error: ${fail.message}`,
        );
        return {
          errors: {
            server: [
              fail.message
                ? fail.message
                : "Image deletion failed due to an unhandled gateway error.",
            ],
          },
        } as DeleteImageActionCmd;
      }
    }
  } catch (error) {
    console.error(
      `image ${slug} deletion failed for user ${
        cookies.data.identity?.username
      } due to unhandled error: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    );
    return {
      errors: {
        server: [
          error instanceof Error
            ? error.message
            : "Image deletion failed due to an unhandled error.",
        ],
      },
    } as DeleteImageActionCmd;
  }

  redirect(returnUrl as string);
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
