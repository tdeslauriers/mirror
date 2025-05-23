"use client";

import { TaskCadence, TaskCategory, TaskTemplate } from "@/app/templates";
import { AllowanceUser, TemplateActionCmd } from ".";
import { useActionState, useEffect, useState } from "react";
import ErrorField from "../errors/error-field";
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from "@/validation/user_fields";
import style from "./task-template-form.module.css";
import FormSubmit from "./form-submit";
import Link from "next/link";

type Err = { [key: string]: string[] };

export default function TemplateForm({
  csrf,
  editAllowed,
  accountVisibility,
  username,
  slug,
  assignees,
  template,
  templateFormUpdate,
}: {
  csrf: string | null;
  username?: string | null; // pulled from cookie for visiblitiy only
  editAllowed?: boolean; // just cookie check => ui rendering logic only
  accountVisibility?: boolean; // just cookie check => ui rendering logic only
  slug: string | null;
  assignees: AllowanceUser[] | null;
  template: TaskTemplate | null;
  templateFormUpdate: (
    prevState: TemplateActionCmd,
    formData: FormData
  ) => TemplateActionCmd | Promise<TemplateActionCmd>;
}) {
  const [templateState, formAction] = useActionState(templateFormUpdate, {
    csrf: csrf,
    slug: slug,
    template: template,
    errors: {},
  });

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    templateState?.template?.category || ""
  );

  const [selectedCadence, setSelectedCadence] = useState<string | undefined>(
    templateState?.template?.cadence || ""
  );

  const [fieldErrors, setFieldErrors] = useState<Err>({});

  const handleSelectCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    if (e.target.value !== "") {
      setSelectedCategory(e.target.value);
    }
  };

  const handleSelectCadence = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    if (e.target.value !== "") {
      setSelectedCadence(e.target.value);
    }
  };

  // assignees
  const [currentUsers, setCurrentUsers] = useState<AllowanceUser[] | null>(
    templateState?.template?.assignees || []
  );

  const [selectedUser, setSelectedUser] = useState("");

  const handleSelectUser = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    if (e.target.value !== "") {
      setSelectedUser(e.target.value);
    }
  };

  const addAssignee = (slug: string | undefined) => {
    const user = assignees?.find((a) => a.allowance_slug === slug);
    if (currentUsers && currentUsers.length > 0) {
      const exists = currentUsers.find((a) => a.allowance_slug === slug);
      if (user && !exists) {
        setCurrentUsers([...currentUsers, user]);
      }
    } else {
      if (user) {
        setCurrentUsers([user]);
      }
    }
    setSelectedUser("");
  };

  const removeUser = (slug: string | undefined) => {
    if (!slug) return;
    if (!currentUsers) return;
    setCurrentUsers(currentUsers.filter((a) => a.allowance_slug !== slug));
  };

  return (
    <>
      <form className="form" action={formAction}>
        {templateState.errors.server && (
          <ErrorField errorMsgs={templateState.errors.server} />
        )}
        {templateState.errors.csrf && (
          <ErrorField errorMsgs={templateState.errors.csrf} />
        )}

        <div className="row">
          <div className="field">
            <label className="label" htmlFor="name">
              Name
            </label>
            {templateState.errors.name && (
              <ErrorField errorMsgs={templateState.errors.name} />
            )}
            <input
              className="form"
              type="text"
              id="name"
              name="name"
              title="Only letters, hyphens, apostrophes, underscores, and spaces allowed"
              minLength={NAME_MIN_LENGTH}
              maxLength={NAME_MAX_LENGTH}
              pattern={`^[a-zA-Z\\-\'\_\ ]+`}
              defaultValue={templateState.template?.name || ""}
              placeholder="Task Name"
              required
              disabled={!editAllowed}
            />
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label className="label" htmlFor="description">
              Description
            </label>
            {templateState.errors.description && (
              <ErrorField errorMsgs={templateState.errors.description} />
            )}
            <textarea
              className="form"
              id="description"
              name="description"
              defaultValue={templateState.template?.description || ""}
              placeholder="Task Description"
              required
              disabled={!editAllowed}
            />
          </div>
        </div>

        <div className="checkbox-row">
          <div className={style.selectfieldleft}>
            <label className="label" htmlFor="category">
              Category
            </label>
            {templateState.errors.category && (
              <ErrorField errorMsgs={templateState.errors.category} />
            )}
            <select
              key={selectedCategory || "default"}
              name="category"
              className="select-category"
              defaultValue={selectedCategory}
              onChange={handleSelectCategory}
              disabled={!editAllowed}
            >
              <option key="no-category-selected" value="">
                Select Category...
              </option>
              {TaskCategory.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className={style.selectfieldright}>
            <label className="label" htmlFor="cadence">
              Cadence
            </label>
            {templateState.errors.cadence && (
              <ErrorField errorMsgs={templateState.errors.cadence} />
            )}
            <select
              key={selectedCadence || "default"}
              name="cadence"
              className="select"
              defaultValue={selectedCadence}
              onChange={handleSelectCadence}
              disabled={!editAllowed}
            >
              <option key="no-cadence-selected" value="">
                Select Cadence...
              </option>
              {TaskCadence.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          className="checkbox-row"
          style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}
        >
          <div className="field">
            <label className="label" htmlFor="calculated">
              Calculated
            </label>
            {templateState.errors.active && (
              <ErrorField errorMsgs={templateState.errors.is_calculated} />
            )}
            <input
              className="form"
              name="is_calculated"
              type="checkbox"
              defaultChecked={templateState.template?.is_calculated}
              disabled={!editAllowed}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="archived">
              Archived
            </label>
            {templateState.errors.active && (
              <ErrorField errorMsgs={templateState.errors.is_archived} />
            )}
            <input
              className="form"
              name="is_archived"
              type="checkbox"
              defaultChecked={templateState.template?.is_archived}
              disabled={!editAllowed}
            />
          </div>
        </div>

        <label className="label" htmlFor="assignee">
          Add Assignee(s)
        </label>

        <div className={style.row}>
          <div className={style.box}>
            <select
              name="assignees-select"
              className="select"
              value={selectedUser}
              onChange={handleSelectUser}
            >
              <option key="no-assignee-selected" value="">
                Select Assignee...
              </option>
              {assignees &&
                assignees.map((a) => (
                  <option key={a.allowance_slug} value={a.allowance_slug}>
                    {`${a.lastname}, ${a.firstname}`}
                  </option>
                ))}
            </select>
          </div>

          <div className={`${style.box} ${style.right}`}>
            <div
              style={{ width: "auto", alignItems: "right" }}
              className={`actions  ${style.right}`}
            >
              <button
                name="add-assignee"
                type="button"
                onClick={() => addAssignee(selectedUser)}
                disabled={!editAllowed}
              >
                Add Assignee
              </button>
            </div>
          </div>
        </div>
        <sub style={{ fontSize: ".75rem" }}>
          * An assignee may only be added once below.
        </sub>
        <hr style={{ marginTop: "2rem" }} />

        {templateState.errors.assignees && (
          <ErrorField errorMsgs={templateState.errors.assignees} />
        )}

        {(!currentUsers || currentUsers.length < 1) && (
          <>
            <div className={style.assigneecard}>
              <span className="highlight-info">No one assigned to task.</span>
            </div>
          </>
        )}

        {currentUsers &&
          currentUsers.map((user) => (
            <div key={user.allowance_slug} className={style.assigneecard}>
              <div className={style.row} style={{ fontSize: "2rem" }}>
                <div className={style.box}>
                  {accountVisibility || user.username === username ? (
                    <Link
                      href={`/allowances/${user.allowance_slug}`}
                      className="locallink"
                      style={{ textDecoration: "none" }}
                    >
                      {`${user.lastname}, ${user.firstname}`}
                    </Link>
                  ) : (
                    <span className="highlight-disabled no-hover-disabled">
                      {`${user.lastname}, ${user.firstname}`}
                    </span>
                  )}
                </div>
                <div className={`${style.box} ${style.right}`}>
                  <div
                    style={{ width: "auto", alignItems: "right" }}
                    className={`actions  ${style.right}`}
                  >
                    <button
                      name="remove-assignee"
                      type="button"
                      onClick={() => removeUser(user.allowance_slug)}
                      disabled={!editAllowed}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
              <input
                type="hidden"
                name="assignees[]"
                value={user.username}
                key={user.username}
              />
            </div>
          ))}

        {editAllowed && (
          <div className={`row`}>
            <FormSubmit
              buttonLabel={
                templateState.template?.slug ? "Update Task" : "Create Task"
              }
              pendingLabel={
                templateState.template?.slug
                  ? "Updating Task..."
                  : "Creating Task..."
              }
            />
          </div>
        )}
      </form>
    </>
  );
}
