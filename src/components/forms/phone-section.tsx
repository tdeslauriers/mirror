"use client";

import styles from "./address-form.module.css";
import { Phone } from "@/app/users";
import { useState } from "react";
import PhoneForm from "./phone-form";
import {
  handlePhoneAdd,
  handlePhoneEdit,
  handlePhoneRemove,
} from "@/app/profile/actions-phone";

export default function PhoneSection({
  profilePhones,
  editAllowed,
  csrf,
  username,
}: {
  profilePhones: Phone[] | null;
  editAllowed?: boolean; // just cookie check => ui rendering logic only
  csrf?: string | null;
  username?: string | null;
}) {
  const [showForm, setShowForm] = useState(false);
  const [disableShowForm, setDisableShowForm] = useState(false); // to prevent add button from being clicked multiple times before form shows
  const [phones, setPhones] = useState<Phone[] | null>(profilePhones);

  const handleAddClick = () => {
    // check that there are not already 3 phones on record before allowing add form to show
    if (phones && phones.length >= 3) {
      // should not be possible to click add if 3 phones already, but just in case
      setDisableShowForm(true);
      alert("You can only have up to 3 phone numbers on a record.");
      return;
    }
    setShowForm(!showForm);
  };

  return (
    <>
      {/* add button */}
      <div className="row">
        <div className={`box`}>
          {/* no phones on file */}
          {(!phones || phones.length === 0) && (
            <span className="highlight-info">
              No phone numbers on record. You may add up to 3.
            </span>
          )}

          {/* phones count between 0 and 3  */}
          {phones && phones.length > 0 && phones.length < 3 && (
            <span
              className={
                phones && phones.length > 0 ? `highlight` : `highlight-info`
              }
            >
              {phones.length} phone number{phones.length > 1 ? "s" : ""} on
              record. You may add up to 3.
            </span>
          )}

          {/* 3 phones on file */}
          {((phones && phones.length >= 3) || disableShowForm) && (
            <span className="highlight">
              You cannot add another phone record.
            </span>
          )}
        </div>

        {/* add button */}
        <div className={`${styles.box} ${styles.right} actions`}>
          {editAllowed && (!phones || phones.length < 3) && (
            <button
              name="add_phone"
              className={`add-address-button`}
              onClick={handleAddClick}
              disabled={disableShowForm}
            >
              Add Phone
            </button>
          )}
        </div>
      </div>

      {/*add new phone form */}
      {showForm && editAllowed && (
        <PhoneForm
          editAllowed={editAllowed}
          csrf={csrf ?? null}
          username={username ?? undefined}
          phoneEdit={handlePhoneAdd}
          onSuccess={(newPhone) => {
            // add new phone to local state to update ui with new phone without needing to re-fetch profile data
            setPhones((prev) => [...(prev ?? []), newPhone]);
            setShowForm(false);
          }}
        />
      )}

      {/* existing phone forms */}
      {phones?.map((phone, index) => (
        <div key={phone.slug} style={{ marginBottom: "2rem" }}>
          <hr
            className="divider"
            style={{ marginBottom: "1.5rem", marginTop: "2rem" }}
          />
          <h2>
            <span className="highlight">{`Phone Record ${index + 1}`}</span>
          </h2>
          <PhoneForm
            key={phone.slug}
            editAllowed={editAllowed}
            csrf={csrf ?? null}
            slug={phone.slug ?? undefined}
            username={username ?? undefined}
            phone={phone}
            phoneEdit={handlePhoneEdit}
            onRemove={async () => {
              const result = await handlePhoneRemove(
                phone.slug ?? "",
                csrf ?? "",
                username ?? "",
              );
              if (result.ok) {
                setPhones(
                  (prev) => prev?.filter((p) => p.slug !== phone.slug) ?? null,
                );
              }
              return result;
            }}
          />
        </div>
      ))}
    </>
  );
}
