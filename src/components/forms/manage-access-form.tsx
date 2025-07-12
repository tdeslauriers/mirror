"use client";

import { useActionState, useState } from "react";
import { EntityScopesActionCmd } from ".";
import styles from "./manage-access-form.module.css";
import Link from "next/link";
import FormSubmit from "./form-submit";
import ErrorField from "../errors/error-field";
import { PermissionActionCmd } from "@/app/permissions";

export type AccessItem = {
  csrf?: string;

  id?: string;
  service_name?: string;
  access?: string; // this is the scope or permission, i.e. "CURATOR"
  name?: string;
  description?: string;
  created_at?: string;
  active?: boolean;
  slug?: string;
  link?: string; // this is the link to the access item, i.e. "curator"
};

export default function ManageAccessForm({
  accessLabel, // used for form label, i.e. "scope" or "permission"
  csrf,
  editAllowed,
  entitySlug,
  entityAccessItems,
  menuAccessItems,
  updateAccessItems,
}: {
  accessLabel?: string; // used for form label, i.e. "scope" or "permission"
  csrf?: string | null;
  editAllowed?: boolean; // just cookie check => ui rendering logic only
  entitySlug?: string | null;
  entityAccessItems: AccessItem[] | null;
  menuAccessItems: AccessItem[];
  updateAccessItems: (
    previousState: EntityScopesActionCmd,
    formData: FormData
  ) =>
    | EntityScopesActionCmd
    | PermissionActionCmd
    | Promise<EntityScopesActionCmd | PermissionActionCmd>;
}) {
  const [currentAccessItems, setCurrentAccessItems] = useState<
    AccessItem[] | null
  >(entityAccessItems);
  const [selectedAccessItemName, setSelectedAccessItemName] = useState("");

  // handles the select in the dropdown
  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAccessItemName(e.target.value);
  };

  // adds the selected access item to the currentAccessItems state
  // ie, the list of access item cards on the page,
  // but only if it does not already exist
  // this only adds it in the ui, it does not call downstream services
  const addAccessItem = (itemSlug: string | undefined) => {
    const accessItem = menuAccessItems.find((s) => s.slug === itemSlug);
    if (currentAccessItems && currentAccessItems.length > 0) {
      const exists = currentAccessItems.find((s) => s.slug === itemSlug);
      if (accessItem && !exists) {
        setCurrentAccessItems([...currentAccessItems, accessItem]);
      }
    } else {
      if (accessItem) {
        setCurrentAccessItems([accessItem]);
      }
    }
    setSelectedAccessItemName("");
  };

  // removes the access item from the currentAccessItems state
  // ie, the list of access item cards on the page,
  // but only if it exists
  // this only removes it in the ui, it does not call downstream services
  const removeAccessItem = (slug: string | undefined) => {
    if (!slug) return;
    if (!currentAccessItems) return;
    setCurrentAccessItems(currentAccessItems.filter((s) => s.slug !== slug));
  };

  const [entityAccessState, formAction] = useActionState(updateAccessItems, {
    csrf: csrf,
    slug: entitySlug,
    // entityActionItems not needed because access items are coming from useState currentScopes variable
    errors: {},
  });

  return (
    <>
      <form className="form" action={formAction}>
        {entityAccessState.errors.server && (
          <ErrorField errorMsgs={entityAccessState.errors.server} />
        )}

        {/* form content: selector, add, and update controls */}
        {editAllowed && (
          <>
            <label>{`add ${accessLabel}`}</label>
            <div className={styles.row}>
              <div className={styles.box}>
                <select
                  name={`${accessLabel}-select`}
                  className={styles.select}
                  value={selectedAccessItemName}
                  onChange={handleSelect}
                >
                  <option value="">{`Select ${accessLabel}...`}</option>
                  {menuAccessItems.map((m) => (
                    <option key={m.slug} value={m.slug}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={`${styles.box} ${styles.right}`}>
                <div
                  style={{ width: "auto", alignItems: "right" }}
                  className={`actions  ${styles.right}`}
                >
                  <button
                    name={`add-${accessLabel}`}
                    type="button"
                    onClick={() => addAccessItem(selectedAccessItemName)}
                  >
                    Add {`${accessLabel}`}
                  </button>
                </div>
              </div>
            </div>
            <sub style={{ fontSize: ".75rem" }}>
              * A {`${accessLabel}`} may only be added once below.
            </sub>

            {/* submit form button */}
            <div className={`row`} style={{ marginTop: "2rem" }}>
              <FormSubmit
                buttonLabel={`Update ${accessLabel}s`}
                pendingLabel={`updating assigned ${accessLabel}s...`}
              />
            </div>

            <hr style={{ marginTop: "2rem" }} />
          </>
        )}

        {/* list of current access items -> will include added and removed items if clicked */}
        {(!currentAccessItems || currentAccessItems.length < 1) && (
          // if no acccess items exist
          <>
            <div className={styles.scopecard}>
              <span className="highlight-info">{`No {${accessLabel}s assigned.`}</span>
            </div>
          </>
        )}

        {/* if there are access items attached to an entity */}
        {currentAccessItems &&
          currentAccessItems.map((item) => (
            <div key={item.slug} className={styles.scopecard}>
              {/* the box object that contains the access item representation */}
              {/* first row with the link to the access object and the service name */}
              <div className={styles.row} style={{ fontSize: "2rem" }}>
                <div className={styles.box}>
                  <Link
                    className="locallink no-hover"
                    href={`/${accessLabel}s/${item.link}`}
                  >
                    {item.access}
                  </Link>
                </div>
                <div className={`${styles.box} ${styles.right}`}>
                  <h3>
                    <span className="highlight">{item.service_name}</span>
                  </h3>
                </div>
              </div>
              <hr className="page-title" style={{ width: "auto" }} />

              {/* second row with the access item name */}
              <div
                className={styles.row}
                style={{ marginTop: "0.5rem", fontWeight: "bold" }}
              >
                <div className={styles.box}>{item.name}</div>
              </div>

              {/* third row with the access item description and remove button */}
              <div className={styles.row}>
                <div className={styles.box} style={{}}>
                  {item.description}
                </div>
                <div className={`${styles.box} ${styles.right}`}>
                  {/* remove button */}
                  <div
                    style={{ width: "auto", alignItems: "right" }}
                    className={`actions  ${styles.right}`}
                  >
                    <button
                      type="button"
                      onClick={() => removeAccessItem(item.slug)}
                      disabled={!editAllowed}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
              <input
                type="hidden"
                name={`${accessLabel}s[]`}
                value={item.slug}
              />
            </div>
          ))}

        {/* submit form button */}
        {editAllowed && (
          <div className={`row`}>
            <FormSubmit
              buttonLabel={`Update ${accessLabel}s`}
              pendingLabel={`updating assigned ${accessLabel}s...`}
            />
          </div>
        )}
      </form>
    </>
  );
}
