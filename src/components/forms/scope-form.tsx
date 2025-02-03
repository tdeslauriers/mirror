"use client";

import { useActionState } from "react";

import {
  SCOPE_MAX_LENGTH,
  SCOPE_MIN_LENGTH,
  SCOPE_NAME_MAX_LENGTH,
  SCOPE_NAME_MIN_LENGTH,
  SERVICENAME_MAX_LENGTH,
  SERVICENAME_MIN_LENGTH,
} from "@/validation/scope_fields";
import FormSubmit from "@/components/forms/form-submit";
import ErrorField from "@/components/errors/error-field";

export type Scope = {
  csrf?: string;

  scope_id?: string;
  service_name?: string;
  scope?: string;
  name?: string;
  description?: string;
  created_at?: string;
  active?: boolean;
  slug?: string;
};

export type ScopeActionCmd = {
  csrf?: string;
  slug?: string | null;
  scope?: Scope | null;
  errors: { [key: string]: string[] };
};

export default function ScopeForm({
  csrf,
  slug,
  scope,
  scopeFormUpdate,
}: {
  csrf: string;
  slug: string | null;
  scope: Scope | null;
  scopeFormUpdate: (
    prevState: ScopeActionCmd,
    formData: FormData
  ) => ScopeActionCmd | Promise<ScopeActionCmd>;
}) {
  const [scopeState, formAction] = useActionState(scopeFormUpdate, {
    csrf: csrf,
    slug: slug,
    scope: scope,
    errors: {},
  });

  return (
    <>
      <form className="form" action={formAction}>
        {scopeState.errors.server && (
          <ErrorField errorMsgs={scopeState.errors.server} />
        )}

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
            />
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label className="label" htmlFor="scope">
              Scope{" "}
              <sup style={{ fontSize: ".7rem" }}>
                <span className="highlight">
                  *Be very careful changing this field
                </span>
              </sup>
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
            />
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label className="label" htmlFor="name">
              Name
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
              placeholder="Name"
              required
            />
          </div>
        </div>

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
            />
          </div>
        </div>

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
            />
          </div>
        </div>

        <div className={`row`}>
          <FormSubmit
            buttonLabel="update scope data"
            pendingLabel="updating scope record..."
          />
        </div>
      </form>
    </>
  );
}
