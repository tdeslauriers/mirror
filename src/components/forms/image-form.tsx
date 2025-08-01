"use client";

import { useActionState } from "react";
import ErrorField from "../errors/error-field";
import FormSubmit from "./form-submit";
import {
  IMAGE_DESCRIPTION_MAX_LENGTH,
  IMAGE_DESCRIPTION_MIN_LENGTH,
  IMAGE_TITLE_MAX_LENGTH,
  IMAGE_TITLE_MIN_LENGTH,
} from "@/validation/image_fields";
import { ImageActionCmd, UpdateImageCmd } from "@/app/images";

export default function ImageForm({
  csrf,
  slug,
  data,
  imageFormUpdate,
}: {
  csrf: string | null;
  slug: string | null;
  data: UpdateImageCmd | null;
  imageFormUpdate: (
    prevState: ImageActionCmd,
    formData: FormData
  ) => ImageActionCmd | Promise<ImageActionCmd>;
}) {
  const [imageState, formAction] = useActionState(imageFormUpdate, {
    csrf: csrf,
    slug: slug,
    updateCmd: data,
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

      {/* submit button */}
      <div className={`row`}>
        <FormSubmit
          buttonLabel={"Update image data"}
          pendingLabel={"Updateing image data..."}
        />
      </div>
    </form>
  );
}
