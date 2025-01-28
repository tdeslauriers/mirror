"use client";

import { useActionState } from "react";
import { Scope, ScopeActionCmd } from "..";
import { SCOPE_MAX_LENGTH, SCOPE_MIN_LENGTH } from "@/validation/scope_fields";

export default function ScopeForm({
  csrf,
  scope,
  scopeEdit,
}: {
  csrf: string;
  scope: Scope;
  scopeEdit: (
    prevState: ScopeActionCmd,
    formData: FormData
  ) => ScopeActionCmd | Promise<ScopeActionCmd>;
}) {
  const [scopeState, formAction] = useActionState(scopeEdit, {
    csrf: csrf,
    scope: scope,
    errors: {},
  });

  return (
    <>
      <form className="form" action={formAction}>
        <div className="row">
          <div className="field">
            <label className="label" htmlFor="service_name">
              Service Name
            </label>
            <input
              className="form"
              name="service_name"
              type="text"
              minLength={SCOPE_MIN_LENGTH}
              maxLength={SCOPE_MAX_LENGTH}
              defaultValue={scopeState.scope?.service_name}
              placeholder="Service Name"
              required
            />
          </div>
        </div>
      </form>
    </>
  );
}
