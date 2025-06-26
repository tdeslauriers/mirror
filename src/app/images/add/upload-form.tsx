"use client";

import React, { useRef, useState } from "react";
import styles from "../image.module.css";
import {
  ALLOWED_IMAGE_FILE_TYPES,
  checkImageDescription,
  IMAGE_DESCRIPTION_MAX_LENGTH,
  IMAGE_DESCRIPTION_MIN_LENGTH,
  IMAGE_TITLE_MAX_LENGTH,
  IMAGE_TITLE_MIN_LENGTH,
} from "@/validation/image_fields";
import { requestPresignedUrl } from "./actions";
import ErrorField from "@/components/errors/error-field";

export default function UploadForm({ csrf }: { csrf?: string | null }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [serverErrors, setServerErrors] = useState<Record<
    string,
    string[]
  > | null>(null);

  // ref for file input to reset after upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // html form does basic validation on title and description fields
    // the server action and upstream with do the proper validation

    // check for image file
    if (!file) {
      alert("Please select an image/photo file to upload.");
      return;
    }

    // check file type
    if (!ALLOWED_IMAGE_FILE_TYPES.includes(file.type)) {
      alert(
        `Invalid file type. Allowed types are: ${ALLOWED_IMAGE_FILE_TYPES.join(
          ", "
        )}`
      );
      return;
    }

    // check file size
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds the limit of 10 MB.");
      return;
    }

    // check description --> regex validation (not possible in textarea element)
    const check = checkImageDescription(description);
    if (!check.isValid) {
      alert(`Description validation failed: ${check.messages.join(", ")}`);
      setStatus("error");
      return;
    }

    // build the form data
    const metadata = new FormData();
    metadata.append("csrf", csrf ?? "");
    metadata.append("title", title);
    metadata.append("description", description);
    metadata.append("content_type", file.type);
    metadata.append("file_size", file.size.toString());

    // stage 1: upload the metadata and request the presigned PUT upload URL
    setStatus("uploading");
    const metaDataResponse = await requestPresignedUrl(metadata);
    if (
      metaDataResponse?.errors &&
      Object.keys(metaDataResponse.errors).length > 0
    ) {
      setServerErrors(metaDataResponse.errors);
      setStatus("error");
      return;
    }

    // stage 2: upload the file to the presigned URL
    if (metaDataResponse?.signedUrl) {
      // for dev --> need a proxy to handle CORS client http --> https minio server
      const targetUrl =
        process.env.NODE_ENV === "development"
          ? `/api/upload?url=${encodeURIComponent(metaDataResponse.signedUrl)}`
          : metaDataResponse.signedUrl;
      // send file to minio server
      const uploadResponse = await fetch(targetUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (uploadResponse.ok) {
        const success = await uploadResponse.json();
        setStatus("success");
        fileInputRef.current?.value && (fileInputRef.current.value = "");
        setTitle(""); // reset title input
        setDescription(""); // reset description input
        setFile(null); // reset file input
      } else {
        const errorData = await uploadResponse.json();
        console.error("Upload failed:", errorData);
        setServerErrors({ upload: ["Failed to upload image."] });
        setStatus("error");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`form`}>
      {/* server errors */}
      {serverErrors && serverErrors.server && (
        <ErrorField errorMsgs={serverErrors.server} />
      )}
      {/* upload errors */}
      {serverErrors && serverErrors.upload && (
        <ErrorField errorMsgs={serverErrors.upload} />
      )}
      {/* csrf errors */}
      {serverErrors && serverErrors.csrf && (
        <ErrorField errorMsgs={serverErrors.csrf} />
      )}

      {/* image title */}
      <div className={`${styles.row}`}>
        <div className={`field`}>
          <label className={`label`} htmlFor="title">
            Title
          </label>
          {serverErrors && serverErrors.title && (
            <ErrorField errorMsgs={serverErrors.title} />
          )}
          <input
            className="form"
            name="title"
            type="text"
            minLength={IMAGE_TITLE_MIN_LENGTH}
            maxLength={IMAGE_TITLE_MAX_LENGTH}
            // pattern={`^[a-zA-Z0-9 ]+$`}
            title={`Title must be between ${IMAGE_TITLE_MIN_LENGTH} and ${IMAGE_TITLE_MAX_LENGTH} alpha/numeric characters`}
            placeholder="Image/Photo Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
      </div>

      {/* image description */}
      <div className={`${styles.row}`}>
        <div className={`field`}>
          <label className={`label`} htmlFor="title">
            Description
          </label>
          {serverErrors && serverErrors.description && (
            <ErrorField errorMsgs={serverErrors.description} />
          )}
          <textarea
            className="form"
            name="title"
            minLength={IMAGE_DESCRIPTION_MIN_LENGTH}
            maxLength={IMAGE_DESCRIPTION_MAX_LENGTH}
            title={`Description must be between ${IMAGE_DESCRIPTION_MIN_LENGTH} and ${IMAGE_DESCRIPTION_MAX_LENGTH} characters`}
            placeholder="Image/Photo Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
      </div>

      {/* image upload */}
      <label className={`label`}>File</label>
      {serverErrors && serverErrors.file && (
        <ErrorField errorMsgs={serverErrors.file} />
      )}
      <div className={`${styles.row} `} style={{ marginTop: "0.5rem" }}>
        <div className={`${styles.box}`}>
          {/* this label is used to style the label as a stand-in for <input type=file> which does not allow much custom styling */}
          <label className={styles.buttonlabel} htmlFor="imageupload">
            Select File
          </label>

          {/* the actual input mechanism is hidden, but the label is htmlFor its functionality */}
          <input
            hidden
            id="imageupload"
            type="file"
            name="imagefile"
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
            }}
            // required: removing required since this is hidden -> error handled on submit
          />
        </div>
        <div className={`${styles.box} ${styles.right}`}>
          <span
            className={file ? `highlight` : `highlight-info`}
            style={{ alignItems: "left" }}
          >
            {file?.name || "*No file selected"}
          </span>
        </div>
      </div>

      {/* form submission */}
      <div className={`${styles.row}`}>
        <div className={`actions`}>
          <button className="" type="submit" disabled={status === "uploading"}>
            {status === "uploading" ? "Uploading..." : "Upload Image/Photo"}
          </button>
        </div>
      </div>
    </form>
  );
}
