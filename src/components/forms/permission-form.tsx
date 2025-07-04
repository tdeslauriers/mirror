"use client";

import { Permission, PermissionActionCmd } from "@/app/permissions";
import { useActionState } from "react";
import ErrorField from "../errors/error-field";
import {
  SERVICENAME_MAX_LENGTH,
  SERVICENAME_MIN_LENGTH,
} from "@/validation/service_client_field";
import {
  SCOPE_NAME_MAX_LENGTH,
  SCOPE_NAME_MIN_LENGTH,
} from "@/validation/scope_fields";
import FormSubmit from "./form-submit";

export default function PermissionForm({
  csrf,
  editAllowed,
  slug,
  permission,
  permissionFormUpdate,
}: {
  csrf: string | null;
  editAllowed: boolean;
  slug: string | null;
  permission: Permission | null;
  permissionFormUpdate: (
    prevState: PermissionActionCmd,
    formData: FormData
  ) => PermissionActionCmd | Promise<PermissionActionCmd>;
}) {
  const [permissionState, formAction] = useActionState(permissionFormUpdate, {
    csrf: csrf,
    slug: slug,
    permission: permission,
    errors: {},
  });

  return (
    <form className="form" action={formAction}>
      {permissionState.errors.server && (
        <ErrorField errorMsgs={permissionState.errors.server} />
      )}
      {permissionState.errors.csrf && (
        <ErrorField errorMsgs={permissionState.errors.csrf} />
      )}

      {/*Service Name */}
      <div className="row">
        <div className="field">
          <label className="label" htmlFor="name">
            Service
          </label>
          {permissionState.errors.service_name && (
            <ErrorField errorMsgs={permissionState.errors.service_name} />
          )}
          <input
            className="form"
            name="service"
            type="text"
            minLength={SERVICENAME_MIN_LENGTH}
            maxLength={SERVICENAME_MAX_LENGTH}
            pattern="[a-z ]+" // only lowercase letters
            title="Only lowercase letters allowed"
            defaultValue={permissionState.permission?.service}
            placeholder="Service Name"
            required
            disabled={!editAllowed}
          />
        </div>
      </div>

      {/* Permission Name */}
      <div className="row">
        <div className="field">
          <label className="label" htmlFor="name">
            permission
          </label>
          {permissionState.errors.name && (
            <ErrorField errorMsgs={permissionState.errors.name} />
          )}
          <input
            className="form"
            name="name"
            type="text"
            minLength={SCOPE_NAME_MIN_LENGTH}
            maxLength={SCOPE_NAME_MAX_LENGTH}
            pattern="[a-zA-Z0-9]+" // only letters and numbers
            defaultValue={permissionState.permission?.name}
            placeholder="Permission Name"
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
          {permissionState.errors.description && (
            <ErrorField errorMsgs={permissionState.errors.description} />
          )}
          <textarea
            className="form"
            name="description"
            defaultValue={permissionState.permission?.description}
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
          {permissionState.errors.active && (
            <ErrorField errorMsgs={permissionState.errors.active} />
          )}
          <input
            className="form"
            name="active"
            type="checkbox"
            defaultChecked={permissionState.permission?.active}
            disabled={!editAllowed}
          />
        </div>
      </div>

      {/* submit button */}
      {editAllowed && (
        <div className={`row`}>
          <FormSubmit
            buttonLabel={
              permissionState.permission?.slug
                ? "Update permission data"
                : "Add permission"
            }
            pendingLabel={
              permissionState.permission?.slug
                ? "Updating permission record..."
                : "Adding permission..."
            }
          />
        </div>
      )}
    </form>
  );
}
