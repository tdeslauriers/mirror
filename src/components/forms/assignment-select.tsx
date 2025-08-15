"use client";

import Link from "next/link";
import styles from "./assignment-select.module.css";
import ErrorField from "../errors/error-field";

export type AssignedItem = {
  id?: string;
  service_name?: string; // may not be present, i.e., "albums wont have it"
  item_name?: string; // this is the actual scope or permission, i.e. "CURATOR", or object may not have this field
  name?: string;
  description?: string;
  created_at?: string;
  active?: boolean;
  slug?: string;
  link?: string; // this is the link to the access item, i.e. "curator"
};

// for labels
const titleCase = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export default function AssignmentSelect({
  label,
  selectedItem,
  handleSelectItem,
  menuItems,
  addItem,
  currentItems,
  removeItem,
  errors,
}: {
  label: string | null;
  selectedItem: string;
  handleSelectItem: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  menuItems: AssignedItem[] | null;
  addItem: (itemSlug: string) => void;
  currentItems: AssignedItem[] | null;
  removeItem: (itemSlug: string) => void;
  errors: { [key: string]: string[] } | null;
}) {
  return (
    <>
      {/* xref object menu select */}
      <label>{`add ${label ? label : "item"}(s)`}</label>
      {errors && errors.permissions && (
        <ErrorField errorMsgs={errors.permissions} />
      )}
      <div className={styles.row}>
        <div className={styles.box}>
          <select
            name={`${label ? titleCase(label) : "Item"}-select`}
            className={styles.select}
            value={selectedItem}
            onChange={handleSelectItem}
          >
            <option value="">{`Select ${
              label ? titleCase(label) : "Item"
            }...`}</option>
            {menuItems &&
              menuItems.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
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
              name={`add-${label ? label : "item"}`}
              type="button"
              onClick={() => addItem(selectedItem)}
            >
              Add {label ? titleCase(label) : "Item"}
            </button>
          </div>
        </div>
      </div>
      <sub style={{ fontSize: ".75rem" }}>
        * A {`${label ? label : "item"}`} may only be added once below.
      </sub>

      {/* if there are access items attached to an entity */}
      {currentItems && currentItems.length > 0 ? (
        currentItems.map((item) => (
          <div key={item.slug} className={styles.assigncard}>
            {/* the box object that contains the access item representation */}
            {/* first row with the link to the access object and the service name */}
            <div className={styles.row} style={{ fontSize: "2rem" }}>
              <div className={styles.box}>
                <Link
                  className="locallink no-hover"
                  href={item.link ? item.link : ""}
                >
                  {item.item_name}
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
            {/* some items/objects have dont have an item name and name field, like albums */}
            {item.item_name !== item.name && (
              <div
                className={styles.cardrow}
                style={{ marginTop: "0.5rem", fontWeight: "bold" }}
              >
                <div className={styles.box}>{item.name}</div>
              </div>
            )}

            {/* third row with the access item description and remove button */}
            <div className={styles.row}>
              <div className={styles.box}>{item.description}</div>
              <div className={`${styles.box} ${styles.right}`}>
                {/* remove button */}
                <div
                  style={{ width: "auto", alignItems: "right" }}
                  className={`actions  ${styles.right}`}
                >
                  <button
                    type="button"
                    onClick={() => removeItem(item.slug ? item.slug : "")}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div style={{ marginTop: "1.5rem" }}>
          <span className={`highlight-info ${styles.none}`}>
            No {label ? label : "items"}s assigned.
          </span>
        </div>
      )}
    </>
  );
}
