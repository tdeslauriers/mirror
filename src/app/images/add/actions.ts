"use server";

import { checkForSessionCookie } from "@/components/checkCookies";
import { AddImageCmd, validateImageData } from "..";
import { GatewayError, isGatewayError } from "@/app/api";

export async function requestPresignedUrl(formdata: FormData) {
  // get session token
  const sessionCookie = await checkForSessionCookie();

  // collect form data
  const csrf = formdata.get("csrf") as string | null;
  const title = formdata.get("title") as string;
  const description = formdata.get("description") as string;
  const contentType = formdata.get("content_type") as string;
  const fileSize = formdata.get("file_size") as string;
  const permissions = formdata.get("permissions[]") as string;
  const albums = formdata.get("albums[]") as string;

  const cmdPermissions = JSON.parse(permissions || "[]");
  const cmdAlbums = JSON.parse(albums || "[]");

  // build command object
  const addImageCmd = {
    csrf: csrf,
    title: title,
    description: description,
    file_type: contentType,
    size: parseInt(fileSize, 10),
    permissions: cmdPermissions,
    albums: cmdAlbums,
  } as AddImageCmd;

  // validate the command object
  const errors = validateImageData(addImageCmd);
  if (errors && Object.keys(errors).length > 0) {
    return {
      signedUrl: null,
      errors: errors,
    };
  }

  // send request to gateway for presigned URL
  try {
    const response = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/images/upload`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${sessionCookie.value}`,
        },
        body: JSON.stringify(addImageCmd),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return {
        signedUrl: data.signed_url,
        errors: null,
      };
    } else {
      const fail = await response.json();
      if (isGatewayError(fail)) {
        const errors = handleUploadError(fail);
        console.error("Gateway error:", errors);
        return {
          signedUrl: null,
          errors: errors,
        };
      }
    }
  } catch (error) {
    console.error("Error requesting presigned URL:", error);
    throw new Error("An error occurred while requesting the presigned URL.");
  }
}

function handleUploadError(gatewayError: GatewayError) {
  const errors: { [key: string]: string[] } = {};

  switch (gatewayError.code) {
    case 400:
      errors.server = [gatewayError.message];
      return errors;
    case 401:
      errors.server = [gatewayError.message];
      return errors;
    case 403:
      errors.server = [gatewayError.message];
      return errors;
    case 404:
      errors.server = [gatewayError.message];
      return errors;
    case 405:
      errors.server = [gatewayError.message];
      return errors;
    case 422:
      switch (true) {
        case gatewayError.message.includes("title"):
          errors.title = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("file_type"):
          errors.file_type = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("size"):
          errors.size = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("description"):
          errors.description = [gatewayError.message];
          return errors;
        default:
          break;
      }
    default:
      errors.server = ["An unexpected error occurred."];
      return errors;
  }
}
