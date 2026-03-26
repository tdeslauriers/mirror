"use client";

import { Phone, PhoneActionCmd, PhoneTypes } from "@/app/users";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { ApiTimestamp } from "@/app/api";
import ErrorField from "../errors/error-field";
import FormSubmit from "./form-submit";

export default function PhoneForm({
  csrf,
  editAllowed,
  slug,
  username,
  phone,
  phoneEdit,
  onSuccess,
  onRemove,
}: {
  csrf?: string | null;
  editAllowed?: boolean; // just cookie check => ui rendering logic only
  slug?: string;
  username?: string;
  phone?: Phone | null;
  phoneEdit: (
    prevState: PhoneActionCmd,
    formData: FormData,
  ) => PhoneActionCmd | Promise<PhoneActionCmd>;
  onSuccess?: (phone: Phone) => void;
  onRemove?: () => Promise<{ ok: boolean; error?: string }>;
}) {
  const [phoneState, formAction] = useActionState(phoneEdit, {
    csrf: csrf,
    slug: slug ?? undefined,
    username: username,
    phone: phone,
    errors: {},
  });

  const [selectedPhoneType, setSelectedPhoneType] = useState<
    string | undefined
  >(
    phoneState.phone?.phone_type !== undefined
      ? PhoneTypes.get(phoneState.phone.phone_type) || ""
      : "",
  );

  const handlePhoneTypeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    if (e.target.value !== "") {
      setSelectedPhoneType(e.target.value);
      return;
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
        return;
      }
    });
  };

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    if (
      onSuccessRef.current &&
      phoneState.phone != null &&
      Object.keys(phoneState.errors).length === 0
    ) {
      onSuccessRef.current(phoneState.phone as Phone);
    }
  }, [phoneState]);

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
        {phoneState.phone?.created_at &&
        phoneState.phone?.updated_at &&
        phoneState.phone.created_at === phoneState.phone.updated_at
          ? `Phone record added: ${formatRecordDate(phoneState.phone.created_at)}`
          : phoneState.phone?.updated_at
            ? `Phone record updated: ${formatRecordDate(phoneState.phone?.updated_at)}`
            : null}
      </div>
      <form className={`form`} action={formAction}>
        {/* server error */}
        {phoneState.errors?.server && (
          <ErrorField errorMsgs={phoneState.errors.server} />
        )}

        {/* checkbox row for is primary and is current */}
        <div className={`checkbox-row`} style={{ marginBottom: "1rem" }}>
          {/* is current checkbox */}
          <div className={`field`}>
            <label className="label" htmlFor="is_current">
              Is Current
            </label>
            {phoneState.errors?.is_current && (
              <ErrorField errorMsgs={phoneState.errors.is_current} />
            )}
            <input
              type="checkbox"
              id="is_current"
              name="is_current"
              defaultChecked={phoneState.phone?.is_current ?? false}
              disabled={!editAllowed}
            />
          </div>

          {/* is primary checkbox */}
          <div className={`field`}>
            <label className="label" htmlFor="is_primary">
              Is Primary
            </label>
            {phoneState.errors?.is_primary && (
              <ErrorField errorMsgs={phoneState.errors.is_primary} />
            )}
            <input
              type="checkbox"
              id="is_primary"
              name="is_primary"
              defaultChecked={phoneState.phone?.is_primary ?? false}
              disabled={!editAllowed}
            />
          </div>
        </div>

        {/* country code */}
        <div className={`row`}>
          <div className={`field`}>
            <label className="label" htmlFor="country_code">
              Country Code
            </label>
            {phoneState.errors?.country_code && (
              <ErrorField errorMsgs={phoneState.errors.country_code} />
            )}
            <input
              type="text"
              id="country_code"
              name="country_code"
              title="Numbers only: no plus sign or dashes"
              pattern="\d{1,4}"
              defaultValue={phoneState.phone?.country_code ?? ""}
              placeholder="Country Code"
              disabled={!editAllowed}
            />
          </div>
        </div>

        {/* phone number */}
        <div className={`row`}>
          <div className={`field`}>
            <label className="label" htmlFor="phone_number">
              Phone Number
            </label>
            {phoneState.errors?.phone_number && (
              <ErrorField errorMsgs={phoneState.errors.phone_number} />
            )}
            <input
              type="text"
              id="phone_number"
              name="phone_number"
              title="Numbers only: no dashes or parentheses"
              pattern="\d{4,15}"
              defaultValue={phoneState.phone?.phone_number ?? ""}
              placeholder="Phone Number (e.g. 5551234567)"
              disabled={!editAllowed}
            />
          </div>
        </div>

        {/* extension */}
        <div className={`row`}>
          <div className={`field`}>
            <label className="label" htmlFor="extension">
              Extension
            </label>
            {phoneState.errors?.extension && (
              <ErrorField errorMsgs={phoneState.errors.extension} />
            )}
            <input
              type="text"
              id="extension"
              name="extension"
              title="Numbers only"
              pattern="\d{1,10}"
              defaultValue={phoneState.phone?.extension ?? ""}
              placeholder="Extension (optional)"
              disabled={!editAllowed}
            />
          </div>
        </div>

        {/* phone type dropdown */}
        <div className={`row`}>
          <div
            className="phonetype-dropdown`"
            style={{ width: "100%", marginBottom: "1rem" }}
          >
            <label className="label" htmlFor="phone_type">
              Phone Type
            </label>
            {phoneState.errors?.phone_type && (
              <ErrorField errorMsgs={phoneState.errors.phone_type} />
            )}
            <select
              key={selectedPhoneType || "default_phone"}
              id="phone_type"
              name="phone_type"
              className="select"
              defaultValue={selectedPhoneType ?? ""}
              onChange={handlePhoneTypeSelect}
              disabled={!editAllowed}
            >
              <option value="">Select phone type...</option>
              {[...PhoneTypes.entries()].map(([key, type]) => (
                <option key={key} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* submit */}
        {editAllowed && (
          <div className={`row`} style={{ marginTop: "1.5rem" }}>
            <FormSubmit
              buttonLabel={`${phoneState.slug ? "update" : "save"} phone`}
              pendingLabel={`${phoneState.slug ? "updating" : "saving"} phone record...`}
            />
          </div>
        )}

        {/* remove button */}
        {editAllowed && onRemove && (
          <div className={`row actionsRemove`} style={{ marginTop: "0.75rem" }}>
            {removeError && <ErrorField errorMsgs={[removeError]} />}
            <button
              type="button"
              className={`btn`}
              onClick={handleRemove}
              disabled={removePending}
            >
              {removePending ? "removing phone..." : "remove phone"}
            </button>
          </div>
        )}
      </form>
    </>
  );
}
