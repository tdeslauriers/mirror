"use client";

import { useState } from "react";
import { Album } from "..";
import styles from "../album.module.css";
import AlbumForm from "@/components/forms/album-form";
import { useParams } from "next/navigation";

export default function AlbumDisplay({
  csrf,
  editAllowed,
  slug,
  albumData,
  albumFormUpdate,
}: {
  csrf: string | null;
  editAllowed?: boolean;
  slug: string | null;
  albumData: Album | null;
  albumFormUpdate: (prevState: any, formData: FormData) => any | Promise<any>;
}) {
  const [isEditing, setIsEditing] = useState(false);

  // need to know if the slug is "staged" to disable editing
  const params = useParams();

  return (
    <div className="card">
      <div className={styles.title}>
        {/* title */}
        {/* hide when editing */}
        {!isEditing ? (
          <h2>
            Album:{" "}
            <span className="highlight">
              {albumData ? albumData?.title : ""}
            </span>
          </h2>
        ) : (
          <h2>Update Album Data:</h2>
        )}

        {/* edit button */}
        {editAllowed && params.slug !== "staged" && (
          <div
            className={isEditing ? `actionsError` : `actions ${styles.edit}`}
          >
            <button
              className=""
              type="button"
              onClick={() => {
                setIsEditing(!isEditing);
              }}
            >
              {isEditing ? "Cancel" : "Edit Album"}
            </button>
          </div>
        )}
      </div>

      {/* title divider */}
      <hr />

      {/* description */}
      {/* hide when editing */}
      {!isEditing && (
        <div className={styles.description}>
          <p>
            {albumData ? albumData.description : "No description available."}
          </p>
        </div>
      )}

      {/* album form */}
      {isEditing && params.slug !== "staged" && (
        <div className={styles.form}>
          <AlbumForm
            csrf={csrf}
            slug={slug}
            album={albumData}
            handleAlbumForm={albumFormUpdate}
          />
        </div>
      )}

      {/* banner for staged album */}
      {params.slug === "staged" && (
        <div className={styles.stagedbanner}>
          <ul>
            <li>
              You cannot edit the Staged album&apos;s <strong>title</strong> or{" "}
              <strong>description</strong> because it doesnt exist in the
              database.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
