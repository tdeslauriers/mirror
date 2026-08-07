"use client";

import { useActionState } from "react";

import {
  SCOPE_MAX_LENGTH,
  SCOPE_MIN_LENGTH,
  SCOPE_NAME_MAX_LENGTH,
  SCOPE_NAME_MIN_LENGTH,
} from "@/validation/scope_fields";
import FormSubmit from "@/components/forms/form-submit";
import ErrorField from "@/components/errors/error-field";

import {
  SERVICENAME_MAX_LENGTH,
  SERVICENAME_MIN_LENGTH,
} from "@/validation/service_client_field";
import { Scope, ScopeActionCmd } from "@/app/scopes";

export default function ScopeForm({
  editAllowed,
  scope,
  scopeFormUpdate,
}: {
  editAllowed?: boolean;
  scope: Scope | null;
  scopeFormUpdate: (
    prevState: ScopeActionCmd,
    formData: FormData,
  ) => ScopeActionCmd | Promise<ScopeActionCmd>;
}) {
  const [scopeState, formAction] = useActionState(scopeFormUpdate, {
    scope: scope,
    errors: {},
  });

  return (
    <>
      <form
        className="form"
        action={formAction}
        key={scopeState.scope?.updated_at ?? "new"}
      >
        {/* update banner */}
        {scopeState.scope?.updated_at && (
          <div
            className="row"
            style={{ fontStyle: "italic", justifyContent: "right" }}
          >
            Last updated{" "}
            {new Date(scopeState.scope?.updated_at).toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              timeZone: "America/Chicago",
            })}
          </div>
        )}

        {/* server errors */}
        {scopeState.errors.server && (
          <ErrorField errorMsgs={scopeState.errors.server} />
        )}

        {/* service name */}
        <div className="row">
          <div className="field">
            <label className="label" htmlFor="service_name">
              Service Name
            </label>
            {scopeState.errors.service_name && (
              <ErrorField errorMsgs={scopeState.errors.service_name} />
            )}
            <input
              className="form"
              name="service_name"
              type="text"
              minLength={SERVICENAME_MIN_LENGTH}
              maxLength={SERVICENAME_MAX_LENGTH}
              pattern="[a-z ]+" // only lowercase letters
              title="Only lowercase letters allowed"
              defaultValue={scopeState.scope?.service_name}
              placeholder="Service Name"
              required
              disabled={!editAllowed}
            />
          </div>
        </div>

        {/* scope */}
        <div className="row">
          <div className="field">
            <label className="label" htmlFor="scope">
              Scope{" "}
              {/* slug will only exist if this is an existing scope
              ie, wont show on add form */}
              {scopeState.scope?.slug && (
                <sup style={{ fontSize: ".7rem" }}>
                  <span className="highlight">
                    *Be very careful changing this field
                  </span>
                </sup>
              )}
            </label>
            {scopeState.errors.scope && (
              <ErrorField errorMsgs={scopeState.errors.scope} />
            )}
            <input
              className="form"
              name="scope"
              type="text"
              minLength={SCOPE_MIN_LENGTH}
              maxLength={SCOPE_MAX_LENGTH}
              pattern="[a-z0-9:*]+"
              title="Scope must be in the format: r:ran:*"
              defaultValue={scopeState.scope?.scope}
              placeholder="Scope"
              required
              disabled={!editAllowed}
            />
          </div>
        </div>

        {/* scope name */}
        <div className="row">
          <div className="field">
            <label className="label" htmlFor="name">
              Scope Name
            </label>
            {scopeState.errors.name && (
              <ErrorField errorMsgs={scopeState.errors.name} />
            )}
            <input
              className="form"
              name="name"
              type="text"
              minLength={SCOPE_NAME_MIN_LENGTH}
              maxLength={SCOPE_NAME_MAX_LENGTH}
              pattern="[a-zA-Z0-9 ]+" // only letters and numbers
              defaultValue={scopeState.scope?.name}
              placeholder="Scope Name"
              required
              disabled={!editAllowed}
            />
          </div>
        </div>

        {/* description */}
        <div className="row">
          <div className="field">
            <label className="label" htmlFor="description">
              Description
            </label>
            {scopeState.errors.description && (
              <ErrorField errorMsgs={scopeState.errors.description} />
            )}
            <textarea
              className="form"
              name="description"
              defaultValue={scopeState.scope?.description}
              placeholder="Description"
              disabled={!editAllowed}
            />
          </div>
        </div>

        {/* active */}
        <div className="row">
          <div className="field">
            <label className="label" htmlFor="active">
              Active
            </label>
            {scopeState.errors.active && (
              <ErrorField errorMsgs={scopeState.errors.active} />
            )}
            <input
              className="form"
              name="active"
              type="checkbox"
              defaultChecked={scopeState.scope?.active}
              disabled={!editAllowed}
            />
          </div>
        </div>

        {/* submit */}
        {/* submit button */}
        {editAllowed && (
          <div className={`row`}>
            <FormSubmit
              buttonLabel={
                scopeState.scope?.slug ? "Update scope data" : "Add scope"
              }
              pendingLabel={
                scopeState.scope?.slug
                  ? "Updating scope record..."
                  : "Adding scope..."
              }
            />
          </div>
        )}
      </form>
    </>
  );
}
