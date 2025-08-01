"use client";

import Image from "next/image";
import styles from "../image.module.css";
import { Suspense, useState } from "react";
import Loading from "@/components/loading";
import { ImageData, UpdateImageCmd } from "..";
import ImageForm from "@/components/forms/image-form";

export default function ImageDisplay({
  csrf,
  editAllowed,
  slug,
  imageData,
  imageFormUpdate,
}: {
  csrf: string | null;
  editAllowed?: boolean;
  slug: string | null;
  imageData: ImageData | null;
  imageFormUpdate: (prevState: any, formData: FormData) => any | Promise<any>;
}) {
  const [isEditing, setIsEditing] = useState(false);

  // needs to be nullable because the person may not have permission to edit
  let update: UpdateImageCmd | null = null;
  if (csrf && editAllowed && imageData) {
    const month = imageData.image_date
      ? new Date(imageData.image_date).getUTCMonth() + 1
      : undefined;
    const day = imageData.image_date
      ? new Date(imageData.image_date).getUTCDate()
      : undefined;
    const year = imageData.image_date
      ? new Date(imageData.image_date).getUTCFullYear()
      : undefined;

    update = {
      csrf: csrf,
      slug: slug,
      title: imageData.title,
      description: imageData?.description,
      image_date_month: month,
      image_date_day: day,
      image_date_year: year,
      is_published: imageData.is_published,
      is_archived: imageData.is_archived,
    };
  }

  return (
    <>
      <div className={styles.imagecard}>
        <div className={styles.cardtext}>
          {/* // edit button switches from display to form */}
          {editAllowed && (
            <div
              className={isEditing ? `actionsError` : `actions`}
              style={{ paddingBottom: "1rem" }}
            >
              <button
                className="image-edit"
                type="button"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel" : "Edit Image Data"}
              </button>
            </div>
          )}

          {!isEditing ? (
            // standard user display
            <>
              {/* title */}
              <div className={styles.title}>
                <span className="highlight">{imageData?.title}</span>
              </div>

              {/* Display the picture taken date if available */}
              {imageData && (
                <div className={styles.date}>
                  {imageData.image_date ? (
                    new Date(imageData.image_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  ) : (
                    <span className="highlight-error">
                      No Image Date on record
                    </span>
                  )}
                </div>
              )}

              {/* published -> only visible to curators and admins */}
              {editAllowed && imageData && (
                <div style={{ fontStyle: "italic", paddingBottom: ".5rem" }}>
                  {imageData.is_published ? (
                    <span>Published</span>
                  ) : (
                    <span className="highlight-error">Not Published</span>
                  )}
                </div>
              )}

              {/* is archived -> only visible to curators and admins */}
              {editAllowed && imageData && (
                <div style={{ fontStyle: "italic", paddingBottom: ".5rem" }}>
                  {imageData.is_archived ? (
                    <span className="highlight-info">Archived</span>
                  ) : (
                    <span>Not Archived</span>
                  )}
                </div>
              )}

              <hr />

              {/* description */}
              <div className={styles.description}>{imageData?.description}</div>
            </>
          ) : (
            <>
              {/* edit form */}
              {editAllowed && (
                <ImageForm
                  csrf={csrf}
                  slug={slug}
                  data={update}
                  imageFormUpdate={imageFormUpdate}
                />
              )}
            </>
          )}
        </div>
        {/* image display */}
        <Image
          className={styles.image}
          src={imageData?.signed_url ? imageData.signed_url : ""}
          alt={imageData?.title ? imageData.title : "site image"}
          width={1000}
          height={1000}
        />
      </div>
    </>
  );
}
