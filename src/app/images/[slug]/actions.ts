"use server";

import { checkForSessionCookie } from "@/components/checkCookies";
import { ImageActionCmd, UpdateImageCmd, validateUpdateImageCmd } from "..";
import { GatewayError, isGatewayError } from "@/app/api";
import { redirect } from "next/navigation";

export async function imageFormUpdate(
  previousState: ImageActionCmd,
  formData: FormData
) {
  // get session token
  const sessionCookie = await checkForSessionCookie();

  // light-weight validation of csrf token
  // true validation happpens in the gateway
  const csrf = previousState.csrf;
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    throw new Error(
      "User update CSRF token missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

  const slug = previousState.slug;
  if (!slug || slug.trim().length < 16 || slug.trim().length > 64) {
    throw new Error(
      "User slug is missing or not well formed.  This value is required and cannot be tampered with."
    );
  }

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
  };

  // validate the updated image data
  const errors = validateUpdateImageCmd(updated);
  if (Object.keys(errors).length > 0) {
    // if there are errors, return the previous state with the errors
    return {
      csrf: csrf,
      slug: slug,
      updateCmd: {
        csrf: csrf,
        slug: slug,
        title: updated.title,
        description: updated.description,
        image_date_month: updated.image_date_month,
        image_date_day: updated.image_date_day,
        image_date_year: updated.image_date_year,
        is_published: updated.is_published,
        is_archived: updated.is_archived,
      } as UpdateImageCmd,
      errors: errors,
    } as ImageActionCmd;
  }

  console.log("Image update command: ", updated);

  // send the update command to the gateway
  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/images/${slug}`,
      {
        method: "PUT",
        headers: {
          Content_Type: "application/json",
          Authorization: `${sessionCookie?.value}`,
        },
        body: JSON.stringify(updated),
      }
    );

    if (apiResponse.ok) {
      //   const success = await apiResponse.json();
      console.log("Image meta data updated successfully:", updated);
    } else {
      const fail = await apiResponse.json();
      console.error("Failed to update image meta data:", fail);
      if (isGatewayError(fail)) {
        const errors = handleImageUpdateErrors(fail);
        return {
          csrf: csrf,
          slug: slug,
          updateCmd: updated,
          errors: errors,
        } as ImageActionCmd;
      } else {
        throw new Error(
          "Unhandled error returned from gateway when attempting to update image metadata."
        );
      }
    }
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "An unknown error occurred while updating image metadata."
    );
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
