"use client";

import { useActionState } from "react";
import { ServiceClient, ServiceClientActionCmd } from ".";
import ErrorField from "../errors/error-field";
import {
  SERVICENAME_MAX_LENGTH,
  SERVICENAME_MIN_LENGTH,
} from "@/validation/service_client_field";
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from "@/validation/user_fields";
import FormSubmit from "./form-submit";

export default function ClientForm({
  csrf,
  editAllowed,
  slug,
  client,
  clientFormUpdate,
}: {
  csrf: string | null;
  editAllowed?: boolean; // just cookie check => ui rendering logic only
  slug: string | null;
  client: ServiceClient | null;
  clientFormUpdate: (
    prevState: ServiceClientActionCmd,
    formData: FormData
  ) => ServiceClientActionCmd | Promise<ServiceClientActionCmd>;
}) {
  const [clientState, formAction] = useActionState(clientFormUpdate, {
    csrf: csrf,
    slug: slug,
    serviceClient: client,
    errors: {},
  });

  return (
    <>
      <form className="form" action={formAction}>
        {clientState.errors.server && (
          <ErrorField errorMsgs={clientState.errors.server} />
        )}

        <div className="row">
          <div className="field">
            <label className="label" htmlFor="name">
              Name
            </label>
            {clientState.errors.name && (
              <ErrorField errorMsgs={clientState.errors.name} />
            )}
            <input
              className="form"
              name="name"
              type="text"
              minLength={SERVICENAME_MIN_LENGTH}
              maxLength={SERVICENAME_MAX_LENGTH}
              pattern="[a-z ]+" // only lowercase letters
              defaultValue={clientState.serviceClient?.name}
              placeholder="Service Name"
              required
              disabled={!editAllowed}
            />
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label className="label" htmlFor="owner">
              Owner
            </label>
            {clientState.errors.owner && (
              <ErrorField errorMsgs={clientState.errors.owner} />
            )}
            <input
              className="form"
              name="owner"
              type="text"
              minLength={NAME_MIN_LENGTH}
              maxLength={NAME_MAX_LENGTH}
              pattern={`^[a-zA-Z\\-\'\_\ ]+`}
              defaultValue={clientState.serviceClient?.owner}
              placeholder="Owner"
              required
              disabled={!editAllowed}
            />
          </div>
        </div>

        <div className="checkbox-row">
          <div className="field">
            <label className="label" htmlFor="enabled">
              Enabled
            </label>
            {clientState.errors.enabled && (
              <ErrorField errorMsgs={clientState.errors.enabled} />
            )}
            <input
              className="form"
              name="enabled"
              type="checkbox"
              defaultChecked={clientState.serviceClient?.enabled}
              disabled={!editAllowed}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="account_expired">
              Account Expired
            </label>
            {clientState.errors.account_expired && (
              <ErrorField errorMsgs={clientState.errors.account_expired} />
            )}
            <input
              className="form"
              name="account_expired"
              type="checkbox"
              defaultChecked={clientState.serviceClient?.account_expired}
              disabled={!editAllowed}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="account_locked">
              Account Locked
            </label>
            {clientState.errors.account_locked && (
              <ErrorField errorMsgs={clientState.errors.account_locked} />
            )}
            <input
              className="form"
              name="account_locked"
              type="checkbox"
              defaultChecked={clientState.serviceClient?.account_locked}
              disabled={!editAllowed}
            />
          </div>
        </div>

        {editAllowed && (
          <div className="row" style={{ marginTop: "1.5rem" }}>
            <FormSubmit
              buttonLabel="update service data"
              pendingLabel="updating service record..."
            />
          </div>
        )}
      </form>
    </>
  );
}
