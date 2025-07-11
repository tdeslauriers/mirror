"use client";

import { Permission, PermissionActionCmd } from "@/app/permissions";
import { useActionState } from "react";
import ErrorField from "../errors/error-field";
import {
  SERVICENAME_MAX_LENGTH,
  SERVICENAME_MIN_LENGTH,
} from "@/validation/service_client_field";
import FormSubmit from "./form-submit";
import {
  PERMISSION_MAX_LENGTH,
  PERMISSION_MIN_LENGTH,
  PERMISSION_NAME_MAX_LENGTH,
  PERMISSION_NAME_MIN_LENGTH,
} from "@/validation/permission-fields";

export default function PermissionForm({
  csrf,
  editAllowed,
  slug,
  service,
  permission,
  permissionFormUpdate,
}: {
  csrf: string | null;
  editAllowed?: boolean;
  slug: string | null;
  service: string | null;
  permission: Permission | null;
  permissionFormUpdate: (
    prevState: PermissionActionCmd,
    formData: FormData
  ) => PermissionActionCmd | Promise<PermissionActionCmd>;
}) {
  const [permissionState, formAction] = useActionState(permissionFormUpdate, {
    csrf: csrf,
    slug: slug,
    service: service,
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
          <label className="label" htmlFor="service_name">
            Service
            {permissionState.service !== null &&
              permissionState.slug !== null && (
                <sup style={{ fontSize: "0.7rem" }}>
                  <span className="highlight">
                    {" "}
                    *Service cannot be changed
                  </span>
                </sup>
              )}
          </label>
          {permissionState.errors.service_name && (
            <ErrorField errorMsgs={permissionState.errors.service_name} />
          )}
          <input
            className="form"
            name="service_name"
            type="text"
            minLength={SERVICENAME_MIN_LENGTH}
            maxLength={SERVICENAME_MAX_LENGTH}
            pattern="[a-z]+" // only lowercase letters
            title="Only lowercase letters allowed"
            defaultValue={permissionState.permission?.service_name}
            placeholder="Service Name"
            required
            disabled={!editAllowed || (service !== null && slug !== null)}
          />
        </div>
      </div>

      {/* Permission */}
      <div className="row">
        <div className="field">
          <label className="label" htmlFor="permission">
            permission{" "}
            {slug && (
              <sup style={{ fontSize: ".7rem" }}>
                <span className="highlight">
                  *Be very careful changing this field
                </span>
              </sup>
            )}
          </label>
          {permissionState.errors.permission && (
            <ErrorField errorMsgs={permissionState.errors.permission} />
          )}
          <input
            className="form"
            name="permission"
            type="text"
            minLength={PERMISSION_MIN_LENGTH}
            maxLength={PERMISSION_MAX_LENGTH}
            pattern="[A-Z0-9_]+" // only capital letters and numbers
            defaultValue={permissionState.permission?.permission}
            placeholder="Permission"
            required
            disabled={!editAllowed}
          />
        </div>
      </div>

      {/* Permission Name */}
      <div className="row">
        <div className="field">
          <label className="label" htmlFor="name">
            permission name
          </label>
          {permissionState.errors.name && (
            <ErrorField errorMsgs={permissionState.errors.name} />
          )}
          <input
            className="form"
            name="name"
            type="text"
            minLength={PERMISSION_NAME_MIN_LENGTH}
            maxLength={PERMISSION_NAME_MAX_LENGTH}
            pattern="[a-zA-Z0-9 ]+" // only letters and numbers
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
