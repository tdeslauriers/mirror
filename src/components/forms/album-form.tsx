"use client";

import { useActionState } from "react";
import ErrorField from "../errors/error-field";
import { Album, AlbumActionCmd } from "@/app/albums";
import {
  ALBUM_DESCRIPTION_MAX_LENGTH,
  ALBUM_DESCRIPTION_MIN_LENGTH,
  ALBUM_TITLE_MAX_LENGTH,
  ALBUM_TITLE_MIN_LENGTH,
} from "@/validation/album_fields";
import FormSubmit from "./form-submit";

export default function AlbumForm({
  csrf,
  slug,
  album,
  handleAlbumForm,
}: {
  csrf: string | null;
  slug: string | null;
  album: Album | null;
  handleAlbumForm: (
    prevState: AlbumActionCmd,
    formData: FormData
  ) => AlbumActionCmd | Promise<AlbumActionCmd>;
}) {
  const [albumState, formAction] = useActionState(handleAlbumForm, {
    csrf: csrf,
    slug: slug,
    album: album,
    errors: {},
  });
  return (
    <>
      <form className="form" action={formAction}>
        {albumState.errors.server && (
          <ErrorField errorMsgs={albumState.errors.server} />
        )}
        {albumState.errors.csrf && (
          <ErrorField errorMsgs={albumState.errors.csrf} />
        )}
        {/* title */}
        <div className="row">
          <div className="field">
            <label className="label" htmlFor="title">
              Title
            </label>
            {albumState.errors.title && (
              <ErrorField errorMsgs={albumState.errors.title} />
            )}
            <input
              className="form"
              name="title"
              type="text"
              title="Title must be between 3 and 32 alpha/numeric characters"
              minLength={ALBUM_TITLE_MIN_LENGTH}
              maxLength={ALBUM_TITLE_MAX_LENGTH}
              pattern="^[a-zA-Z0-9 ]+$"
              defaultValue={albumState.album?.title}
              placeholder="Album Title"
              required
            />
          </div>
        </div>
        {/* description */}
        <div className="row">
          <div className="field">
            <label className="label" htmlFor="description">
              Description
            </label>
            {albumState.errors.description && (
              <ErrorField errorMsgs={albumState.errors.description} />
            )}
            <textarea
              className="form"
              name="description"
              title="Description must be between 2 and 255 characters"
              minLength={ALBUM_DESCRIPTION_MIN_LENGTH}
              maxLength={ALBUM_DESCRIPTION_MAX_LENGTH}
              defaultValue={albumState.album?.description || ""}
              placeholder="Album Description"
              required
            />
          </div>
        </div>
        {/* is archived? */}
        <div className="row">
          <div className="field">
            <label className="label" htmlFor="is_rchived">
              Archived
            </label>
            {albumState.errors.is_archived && (
              <ErrorField errorMsgs={albumState.errors.is_archived} />
            )}
            <input
              className="form"
              name="is_archived"
              type="checkbox"
              defaultChecked={albumState.album?.is_archived}
            />
          </div>
        </div>

        {/* submit button */}
        <div className="row">
          <FormSubmit
            buttonLabel={
              albumState.album?.slug ? "Update Album" : "Create Album"
            }
            pendingLabel={
              albumState.album?.slug
                ? "Updating album record..."
                : "Creating album"
            }
          />
        </div>
      </form>
    </>
  );
}
