"use server";

import { checkForSessionCookie } from "@/components/checkCookies";
import { AddImageCmd, validateImageData } from "..";

export async function requestPresignedUrl(formdata: FormData) {
  // get session token
  const sessionCookie = await checkForSessionCookie();

  // collect form data
  const csrf = formdata.get("csrf") as string | null;
  const title = formdata.get("title") as string;
  const description = formdata.get("description") as string;
  const contentType = formdata.get("content_type") as string;
  const fileSize = formdata.get("file_size") as string;

  // build command object
  const addImageCmd = {
    csrf: csrf,
    title: title,
    description: description,
    content_type: contentType,
    file_size: parseInt(fileSize, 10),
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
}
