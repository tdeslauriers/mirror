"use client";

import styles from "./image-form.module.css";
import { useActionState, useState } from "react";
import ErrorField from "../errors/error-field";
import FormSubmit from "./form-submit";
import {
  IMAGE_DESCRIPTION_MAX_LENGTH,
  IMAGE_DESCRIPTION_MIN_LENGTH,
  IMAGE_TITLE_MAX_LENGTH,
  IMAGE_TITLE_MIN_LENGTH,
} from "@/validation/image_fields";
import { ImageActionCmd, UpdateImageCmd } from "@/app/images";
import { Album } from "@/app/albums";
import { Permission } from "@/app/permissions";
import AssignmentSelect from "./assignment-select";

export default function ImageForm({
  csrf,
  slug,
  imageData,
  menuAlbums,
  menuPermissions,
  imageFormUpdate,
}: {
  csrf: string | null;
  slug: string | null;
  imageData: UpdateImageCmd | null;
  menuAlbums: Album[];
  menuPermissions: Permission[];
  imageFormUpdate: (
    prevState: ImageActionCmd,
    formData: FormData
  ) => ImageActionCmd | Promise<ImageActionCmd>;
}) {
  const [currentAlbums, setCurrentAlbums] = useState<Album[]>(
    imageData && imageData.albums ? imageData.albums : []
  );
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [currentPermissions, setCurrentPermissions] = useState<Permission[]>(
    imageData && imageData.permissions ? imageData.permissions : []
  );
  const [selectedPermission, setSelectedPermission] = useState("");

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
    if (!menuAlbums || !albumSlug) return;
    const album = menuAlbums.find((a) => a.slug === albumSlug);

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
    if (!menuPermissions || !permissionSlug) return;
    const permission = menuPermissions.find((p) => p.slug === permissionSlug);

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

  // form actions and state management
  const [imageState, formAction] = useActionState(imageFormUpdate, {
    csrf: csrf,
    slug: slug,
    updateCmd: imageData,
    errors: {},
  });

  return (
    <form className="form" action={formAction}>
      {/* server errors */}
      {imageState.errors.server && (
        <ErrorField errorMsgs={imageState.errors.server} />
      )}
      {/* csrf errors */}
      {imageState.errors.csrf && (
        <ErrorField errorMsgs={imageState.errors.csrf} />
      )}

      {/* image title */}
      <div className={`row`}>
        <div className={`field`}>
          <label className={`label`} htmlFor="title">
            Title
          </label>
          {imageState.errors.title && (
            <ErrorField errorMsgs={imageState.errors.title} />
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
            defaultValue={imageState.updateCmd?.title}
            required
          />
        </div>
      </div>

      {/* image description */}
      <div className={`row`}>
        <div className={`field`}>
          <label className={`label`} htmlFor="title">
            Description
          </label>
          {imageState.errors.description && (
            <ErrorField errorMsgs={imageState.errors.description} />
          )}
          <textarea
            className="form"
            name="description"
            minLength={IMAGE_DESCRIPTION_MIN_LENGTH}
            maxLength={IMAGE_DESCRIPTION_MAX_LENGTH}
            title={`Description must be between ${IMAGE_DESCRIPTION_MIN_LENGTH} and ${IMAGE_DESCRIPTION_MAX_LENGTH} characters`}
            placeholder="Image/Photo Description"
            defaultValue={imageState.updateCmd?.description}
            required
          />
        </div>
      </div>

      {/* created date -> not all images will be able to have date read from EXIF data */}
      <div className={`row`}>
        <div className={`date`}>
          <label
            className={`label`}
            htmlFor="image_date"
            title="needed for album population and data storage"
          >
            Image Date{" "}
            <sup>
              <span
                className={`highlight-error`}
                style={{ textTransform: "lowercase" }}
              >
                required
              </span>
            </sup>
          </label>
          {imageState.errors.image_date && (
            <ErrorField errorMsgs={imageState.errors.image_date} />
          )}

          <div className={`daterow`}>
            <input
              className={`birthdate`}
              name="image_date_month"
              title="Enter a month number between 1 and 12"
              type="number"
              min={1}
              max={12}
              defaultValue={imageState.updateCmd?.image_date_month ?? ""}
              placeholder="Month"
              required
            />

            <input
              className={`birthdate`}
              name="image_date_day"
              title="Enter a day number between 1 and 31"
              type="number"
              min={1}
              max={31}
              defaultValue={imageState.updateCmd?.image_date_day ?? ""}
              placeholder="Day"
              required
            />

            <input
              className={`birthdate`}
              name="image_date_year"
              title={`Enter a year number between 1826 (year of oldest know photograph) and ${new Date().getUTCFullYear()}`}
              type="number"
              min={1826}
              max={new Date().getUTCFullYear()}
              defaultValue={imageState.updateCmd?.image_date_year ?? ""}
              placeholder="Year"
              required
            />
          </div>
        </div>
      </div>

      {/* active and archived status checkboxes */}
      {imageState.errors.checkboxes && (
        <ErrorField errorMsgs={imageState.errors.checkboxes} />
      )}
      <div className="checkbox-row" style={{ paddingBottom: "1rem" }}>
        {/* is_published field */}
        <div className="field">
          <label className="label" htmlFor="is_published">
            Published
          </label>

          <input
            className="form"
            name="is_published"
            type="checkbox"
            defaultChecked={imageState.updateCmd?.is_published}
          />
        </div>

        {/* is_archived field */}
        <div className="field">
          <label className="label" htmlFor="is_archived">
            Archived
          </label>
          {/* errors consolidated above section */}
          <input
            className="form"
            name="is_archived"
            type="checkbox"
            defaultChecked={imageState.updateCmd?.is_archived}
          />
        </div>
      </div>

      {/* albums select */}
      <h2 className={styles.header}>Assign Album(s)</h2>
      <div className={styles.imagecard}>
        <AssignmentSelect
          label={"album"}
          selectedItem={selectedAlbum}
          handleSelectItem={handleSelectAlbum}
          menuItems={menuAlbums?.map(albumToAssignable) ?? []}
          addItem={addAlbum}
          currentItems={currentAlbums.map(albumToAssignable) ?? []}
          removeItem={removeAlbum}
          errors={imageState.errors}
        />
      </div>

      {/* hidden fields for current albums */}
      {currentAlbums.map((album) => (
        <input
          key={album.slug}
          type="hidden"
          name="albums[]"
          value={album.slug}
        />
      ))}

      {/* permissions select */}
      <h2 className={styles.header}>Assign Permission(s)</h2>
      <div className={styles.imagecard}>
        <AssignmentSelect
          label={"permission"}
          selectedItem={selectedPermission}
          handleSelectItem={handleSelectPermission}
          menuItems={menuPermissions?.map(permissionToAssignable) ?? []}
          addItem={addPermission}
          currentItems={currentPermissions.map(permissionToAssignable) ?? []}
          removeItem={removePermission}
          errors={imageState.errors}
        />
      </div>

      {/* hidden fields for current permissions */}
      {currentPermissions.map((permission) => (
        <input
          key={permission.slug}
          type="hidden"
          name="permissions[]"
          value={permission.slug}
        />
      ))}

      {/* submit button */}
      <div className={`row`} style={{ marginTop: "2rem" }}>
        <FormSubmit
          buttonLabel={"Update image data"}
          pendingLabel={"Updateing image data..."}
        />
      </div>
    </form>
  );
}
