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
import { Permission } from "@/app/permissions";
import AssignmentSelect from "@/components/forms/assignment-select";
import { Album } from "@/app/albums";

export default function UploadForm({
  csrf,
  albums,
  permissions,
}: {
  csrf?: string | null;
  albums?: Album[];
  permissions?: Permission[];
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [currentAlbums, setCurrentAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [currentPermissions, setCurrentPermissions] = useState<Permission[]>(
    []
  );
  const [selectedPermission, setSelectedPermission] = useState("");
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [serverErrors, setServerErrors] = useState<Record<
    string,
    string[]
  > | null>(null);

  // to map albums to the assignment-select component
  const albumToAssignable = (album: Album) => ({
    id: album.id,
    service_name: "gallery",
    item_name: album.title,
    name: album.title,
    description: album.description,
    created_at: album.created_at,
    // no active field in Album
    slug: album.slug,
    link: `/albums/${album.slug}`,
  });

  // handle album selection
  const handleSelectAlbum = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAlbum(e.target.value);
  };

  // add selected album to the form data
  const addAlbum = (albumSlug: string) => {
    if (!albums || !albumSlug) return;
    const album = albums.find((a) => a.slug === albumSlug);

    // check if album already exists
    const exists = currentAlbums.find((a) => a.slug === albumSlug);
    if (album && !exists) {
      setCurrentAlbums([...currentAlbums, album]);
    } else {
      alert("Album already added.");
    }
    setSelectedAlbum(""); // reset selection
  };

  // remove album from the form data
  const removeAlbum = (albumSlug: string | undefined) => {
    if (!albumSlug) return;
    const updatedAlbums = currentAlbums.filter((a) => a.slug !== albumSlug);
    setCurrentAlbums(updatedAlbums);
  };

  // to map permissions to the assignment-select component
  const permissionToAssignable = (p: Permission) => ({
    id: p.uuid,
    service_name: p.service_name,
    item_name: p.permission,
    name: p.name,
    description: p.description,
    created_at: p.created_at,
    active: p.active,
    slug: p.slug,
    link: `/permissions/${p.service_name}/${p.slug}`,
  });

  // handle permission selection
  const handleSelectPermission = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPermission(e.target.value);
  };

  // add selected permission to the form data
  const addPermission = (permissionSlug: string) => {
    if (!permissions || !permissionSlug) return;
    const permission = permissions.find((p) => p.slug === permissionSlug);

    // check if permission already exists
    const exists = currentPermissions.find((p) => p.slug === permissionSlug);
    if (permission && !exists) {
      setCurrentPermissions([...currentPermissions, permission]);
    } else {
      alert("Permission already added.");
    }

    setSelectedPermission(""); // reset selection
  };

  // remove permission from the form data
  const removePermission = (permissionSlug: string | undefined) => {
    if (!permissionSlug) return;
    const updatedPermissions = currentPermissions.filter(
      (p) => p.slug !== permissionSlug
    );
    setCurrentPermissions(updatedPermissions);
  };

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
    metadata.append("permissions[]", JSON.stringify(currentPermissions));
    metadata.append("albums[]", JSON.stringify(currentAlbums));

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
        console.error("File upload failed:", errorData);
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

      <div className="card-title">
        <h2 className={styles.header}>Image/Photo Record Metadata</h2>
      </div>
      <div className={styles.imagecard}>
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
              pattern={`^[a-zA-Z0-9 ]+$`}
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
              name="description"
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
              {file?.name || "No file selected"}
            </span>
          </div>
        </div>
      </div>

      {/* albums select */}
      <h2 className={styles.header}>Assign Album(s)</h2>

      <div className={styles.imagecard}>
        {serverErrors && serverErrors.albums && (
          <ErrorField errorMsgs={serverErrors.albums} />
        )}
        <AssignmentSelect
          label={"album"}
          selectedItem={selectedAlbum}
          handleSelectItem={handleSelectAlbum}
          menuItems={albums?.map(albumToAssignable) ?? []}
          addItem={addAlbum}
          currentItems={currentAlbums.map(albumToAssignable) ?? []}
          removeItem={removeAlbum}
          errors={serverErrors}
        />
      </div>

      {/* permissions select */}
      <h2 className={styles.header}>Assign Permission(s)</h2>
      <div className={styles.imagecard}>
        <AssignmentSelect
          label={"permission"}
          selectedItem={selectedPermission}
          handleSelectItem={handleSelectPermission}
          menuItems={permissions?.map(permissionToAssignable) ?? []}
          addItem={addPermission}
          currentItems={currentPermissions.map(permissionToAssignable) ?? []}
          removeItem={removePermission}
          errors={serverErrors}
        />
      </div>

      {/* form submission */}
      <div className={`${styles.row}`} style={{ marginTop: "2rem" }}>
        <div className={`actions`}>
          <button type="submit" disabled={status === "uploading"}>
            {status === "uploading" ? "Uploading..." : "Upload Image/Photo"}
          </button>
        </div>
      </div>
    </form>
  );
}
