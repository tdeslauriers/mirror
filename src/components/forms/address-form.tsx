"use client";

import { Address, AddressActionCmd } from "@/app/users";
import { US_STATES, COUNTRIES } from "@/validation/address_fields";
import ErrorField from "../errors/error-field";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import styles from "./address-form.module.css";
import FormSubmit from "./form-submit";
import { ApiTimestamp } from "@/app/api";

export default function AddressForm({
  csrf,
  editAllowed,
  slug,
  username,
  address,
  addressEdit,
  onSuccess,
  onRemove,
}: {
  csrf: string | null;
  editAllowed?: boolean; // just cookie check => ui rendering logic only
  slug?: string | null;
  username?: string;
  address: Address | null;
  addressEdit: (
    prevState: AddressActionCmd,
    formData: FormData,
  ) => AddressActionCmd | Promise<AddressActionCmd>;
  onSuccess?: (address: Address) => void;
  onRemove?: () => Promise<{ ok: boolean; error?: string }>;
}) {
  const [addressState, formAction] = useActionState(addressEdit, {
    csrf: csrf,
    slug: slug ?? undefined,
    username: username,
    address: address,
    errors: {},
  });

  // state-province dropdown
  const [stateProvince, setStateProvince] = useState<string | undefined>(
    addressState?.address?.state_province || "",
  );

  const handleSelectState = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    if (e.target.value !== "") {
      setStateProvince(e.target.value);
    }
  };

  // country dropdown
  const [country, setCountry] = useState<string | undefined>(
    addressState?.address?.country || "",
  );

  const handleSelectCountry = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    if (e.target.value !== "") {
      setCountry(e.target.value);
    }
  };

  const [removeError, setRemoveError] = useState<string | null>(null);
  const [removePending, startRemoveTransition] = useTransition();

  const handleRemove = () => {
    if (!onRemove) return;
    startRemoveTransition(async () => {
      setRemoveError(null);
      const result = await onRemove();
      if (!result.ok) {
        setRemoveError(result.error ?? "Failed to remove address.");
      }
    });
  };

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    if (
      onSuccessRef.current &&
      addressState.address != null &&
      Object.keys(addressState.errors).length === 0
    ) {
      onSuccessRef.current(addressState.address as Address);
    }
  }, [addressState]);

  // for formatting the unix seconds date returned by the gateway:
  const formatRecordDate = (timestamp: ApiTimestamp): string => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <div style={{ marginBottom: "1rem", fontStyle: "italic" }}>
        {addressState.address?.created_at &&
        addressState.address?.updated_at &&
        addressState.address.created_at === addressState.address.updated_at
          ? `Record Added: ${formatRecordDate(addressState.address.created_at)}`
          : addressState.address?.updated_at
            ? `Last updated: ${formatRecordDate(addressState.address.updated_at)}`
            : ""}
      </div>
      <form className={`form`} action={formAction}>
        {addressState.errors.server && (
          <ErrorField errorMsgs={addressState.errors.server} />
        )}

        {/* Current and primary checkboxes */}
        <div className="checkbox-row" style={{ marginBottom: "1rem" }}>
          {/* is current checkbox */}
          <div className="field">
            <label className="label" htmlFor="is_current">
              Current
            </label>
            {addressState.errors.is_current && (
              <ErrorField errorMsgs={addressState.errors.is_current} />
            )}
            <input
              className="form"
              name="is_current"
              type="checkbox"
              defaultChecked={addressState.address?.is_current ?? false}
              disabled={!editAllowed}
            />
          </div>

          {/* is primary checkbox */}
          <div className="field" >
            <label className="label" htmlFor="is_primary">
              Primary
            </label>
            {addressState.errors.is_primary && (
              <ErrorField errorMsgs={addressState.errors.is_primary} />
            )}
            <input
              className="form"
              name="is_primary"
              type="checkbox"
              defaultChecked={addressState.address?.is_primary ?? false}
              disabled={!editAllowed}
            />
          </div>
        </div>

        {/* Address Line 1 */}
        <div className={`row`}>
          <div className={`field`}>
            <label className={`label`} htmlFor="street_address">
              Address Line 1
            </label>
            {addressState.errors.street_address && (
              <ErrorField errorMsgs={addressState.errors.street_address} />
            )}
            <input
              className={`form`}
              name="street_address"
              type="text"
              title="Must be between 1-100 characters long and may only include letters, numbers, spaces, commas, periods, apostrophes, hashes, and hyphens."
              pattern="[a-zA-Z0-9\s,.'#-]{1,100}"
              defaultValue={addressState.address?.street_address ?? ""}
              placeholder="Address Line 1"
              required
              disabled={!editAllowed}
            />
          </div>
        </div>

        {/* Address Line 2 */}
        <div className={`row`}>
          <div className={`field`}>
            <label className={`label`} htmlFor="street_address_2">
              Address Line 2{" "}
              <sup>
                <span
                  className={`highlight`}
                  style={{ textTransform: "lowercase" }}
                >
                  optional
                </span>
              </sup>
            </label>
            {addressState.errors.street_address_2 && (
              <ErrorField errorMsgs={addressState.errors.street_address_2} />
            )}
            <input
              className={`form`}
              name="street_address_2"
              type="text"
              title="Must be between 1-100 characters long and may only include letters, numbers, spaces, commas, periods, apostrophes, hashes, and hyphens."
              pattern="[a-zA-Z0-9\s,.'#-]{0,100}"
              defaultValue={addressState.address?.street_address_2 ?? ""}
              placeholder="Address Line 2"
              disabled={!editAllowed}
            />
          </div>
        </div>

        <div className={styles.cszrow}>
          {/* City */}
          <div className={styles.csz}>
            <label className={`label`} htmlFor="city">
              City
            </label>
            {addressState.errors.city && (
              <ErrorField errorMsgs={addressState.errors.city ?? ""} />
            )}
            <input
              className={`form`}
              name="city"
              type="text"
              title="Must be 1-50 characters long and can include letters, spaces, apostrophes, and hyphens."
              pattern="[a-zA-Z\s'-]{1,50}"
              defaultValue={addressState.address?.city ?? ""}
              placeholder="City"
              required
              disabled={!editAllowed}
            />
          </div>

          {/* State */}
          <div className={styles.csz}>
            <label className={`label`} htmlFor="state">
              State
            </label>
            {addressState.errors.state && (
              <ErrorField errorMsgs={addressState.errors.state} />
            )}
            <select
              className={styles.csz}
              name="state"
              value={stateProvince}
              onChange={handleSelectState}
              required
              disabled={!editAllowed}
            >
              <option value="" disabled>
                Select state...
              </option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Postal Code */}
          <div className={styles.csz}>
            <label className={`label`} htmlFor="postal_code">
              Postal Code
            </label>
            {addressState.errors.postal_code && (
              <ErrorField errorMsgs={addressState.errors.postal_code} />
            )}
            <input
              className={`form`}
              name="postal_code"
              type="text"
              title="Must be a valid US ZIP code, either 5 digits or 5 digits followed by a hyphen and 4 digits."
              pattern="\d{5}(-\d{4})?"
              defaultValue={addressState.address?.postal_code ?? ""}
              placeholder="Postal Code"
              required
              disabled={!editAllowed}
            />
          </div>
        </div>

        {/* Country */}
        <div className={`row`} style={{ marginTop: "1rem" }}>
          <div className={`field`}>
            <label className={`label`} htmlFor="country">
              Country
            </label>
            {addressState.errors.country && (
              <ErrorField errorMsgs={addressState.errors.country} />
            )}
            <select
              className={`form`}
              name="country"
              value={country}
              onChange={handleSelectCountry}
              required
              disabled={!editAllowed}
            >
              <option value="" disabled>
                Select country...
              </option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        {editAllowed && (
          <div className={`row`} style={{ marginTop: "1.5rem" }}>
            <FormSubmit
              buttonLabel={`${addressState.slug ? "update" : "save"} address`}
              pendingLabel={`${addressState.slug ? "updating" : "saving"} address record...`}
            />
          </div>
        )}

        {/* Remove */}
        {editAllowed && onRemove && (
          <div className={`row actionsRemove`} style={{ marginTop: "0.75rem" }}>
            {removeError && <ErrorField errorMsgs={[removeError]} />}
            <button
              type="button"
              className={`btn`}
              onClick={handleRemove}
              disabled={removePending}
            >
              {removePending ? "removing address..." : "remove address"}
            </button>
          </div>
        )}
      </form>
    </>
  );
}
