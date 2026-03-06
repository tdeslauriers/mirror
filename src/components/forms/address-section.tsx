"use client";

import { Address } from "@/app/users";
import { useState } from "react";
import styles from "./address-form.module.css";
import AddressForm from "./address-form";
import {
  handleAddressAdd,
  handleAddressEdit,
} from "@/app/profile/actions_address";

export default function AddressSection({
  profileAddresses,
  editAllowed,
  csrf,
  username,
}: {
  profileAddresses: Address[] | null;
  editAllowed?: boolean; // just cookie check => ui rendering logic only
  csrf?: string | null;
  username?: string | null;
}) {
  const [showForm, setShowForm] = useState(false);
  const [disableShowForm, setDisableShowForm] = useState(false); // to prevent add button from being clicked multiple times before form shows
  const [addresses, setAddresses] = useState<Address[] | null>(
    profileAddresses,
  );

  const handleAddClick = () => {
    // check that there are not already 3 addresses on record before allowing add form to show
    if (addresses && addresses.length >= 10) {
      // should not be possible to click add if 3 addresses already, but just in case
      setDisableShowForm(true);
      alert("You can only have up to 3 addresses on record.");
      return;
    }
    setShowForm(!showForm);
  };

  return (
    <>
      {/* add button */}
      <div className="row">
        <div className={`${styles.box}`}>
          {/* Addresses count between 0 and 3  */}
          {addresses && addresses.length > 0 && addresses.length < 3 && (
            <span
              className={
                addresses && addresses.length > 0
                  ? `highlight`
                  : `highlight-info`
              }
            >
              {`You have ${addresses?.length ?? 0} address${addresses && addresses?.length > 1 ? "es" : ""} on record. You may add
                up to 3.`}
            </span>
          )}

          {/* 3 addresses on file */}
          {((addresses && addresses.length >= 3) || disableShowForm) && (
            <span className="highlight-info">
              You cannot add another address.
            </span>
          )}
        </div>

        <div className={`${styles.box} ${styles.right} actions`}>
          {(!addresses || addresses.length < 10) && (
            <button
              name="add_address"
              className={`btn`}
              onClick={handleAddClick}
              disabled={disableShowForm}
            >
              Add Address
            </button>
          )}
        </div>
      </div>

      {/* add new address form */}
      {showForm && (
        <>
          <hr
            className="divider"
            style={{ marginBottom: "1.5rem", marginTop: "2rem" }}
          />
          <h2 style={{ marginBottom: "1rem" }}>Add New Address</h2>
          <AddressForm
            csrf={csrf ?? null}
            editAllowed={editAllowed}
            username={username ?? undefined}
            address={null}
            addressEdit={handleAddressAdd}
            onSuccess={(newAddress) => {
              setAddresses((prev) => [...(prev ?? []), newAddress]);
              setShowForm(false);
            }}
          />
        </>
      )}

      {/* current addresses forms  */}
      {addresses?.map((address, index) => (
        <div key={address.slug} style={{ marginTop: "2rem" }}>
          <hr
            className="divider"
            style={{ marginBottom: "1.5rem", marginTop: "2rem" }}
          />
          <h2>
            <span className="highlight">{`Address ${index + 1}`}</span>
          </h2>
          <AddressForm
            key={address.slug}
            csrf={csrf ?? null}
            editAllowed={editAllowed}
            slug={address.slug ?? undefined}
            username={username ?? undefined}
            address={address}
            addressEdit={handleAddressEdit}
          />
        </div>
      ))}
    </>
  );
}
