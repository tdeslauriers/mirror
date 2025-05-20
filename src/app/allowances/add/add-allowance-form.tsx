"use client";

import FormSubmit from "@/components/forms/form-submit";
import Link from "next/link";
import { useActionState, useState } from "react";
import ErrorField from "@/components/errors/error-field";
import { AddAllowanceActionCmd, AllowanceUser } from "@/components/forms";
import { UserProfile } from "..";

type Err = { [key: string]: string[] };

export default function AddAllowanceForm({
  csrf,
  users,
  addAllowance,
}: {
  csrf: string;
  users: UserProfile[];
  addAllowance: (
    prevState: AddAllowanceActionCmd,
    formData: FormData
  ) => AddAllowanceActionCmd | Promise<AddAllowanceActionCmd>;
}) {
  const [addAllowanceState, formAction] = useActionState(addAllowance, {
    csrf: csrf,
    complete: false,
    errors: {},
  });

  const [selectedUser, setSelectedUser] = useState<string | undefined>(
    addAllowanceState?.slug || ""
  );
  const [selectedUsername, setSelectedUsername] = useState<string | undefined>(
    addAllowanceState?.username || ""
  );
  const [selectedUserSlug, setSelectedUserSlug] = useState<string | undefined>(
    addAllowanceState?.slug || ""
  );
  const [selectedUserDob, setSelectedUserDob] = useState<string | undefined>(
    addAllowanceState?.birth_date || ""
  );

  const [fieldErrors, setFieldErrors] = useState<Err>({}); // client side errors

  // Sync the selected value with form state AFTER form submission

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    if (e.target.value !== "") {
      // find the user by username
      const user = users.find((u) => u.slug === e.target.value);

      if (!user) {
        setFieldErrors({
          dob: ["User does not exist."],
        });
        return;
      }

      // set the value of the selector to the selected user
      setSelectedUser(user?.slug);

      if (!user?.birth_date) {
        setFieldErrors({
          dob: ["User does not have a date of birth in their profile."],
        });
        return;
      } else {
        setFieldErrors({
          dob: [],
        });
        // set the username and slug
        setSelectedUsername(user?.username);
        setSelectedUserSlug(user?.slug);
        setSelectedUserDob(user?.birth_date);
      }
    }
  };

  return (
    <>
      {!addAllowanceState.complete && (
        <form className="form" action={formAction}>
          {addAllowanceState.errors.server && (
            <ErrorField errorMsgs={addAllowanceState.errors.server} />
          )}
          {addAllowanceState.errors.csrf && (
            <ErrorField errorMsgs={addAllowanceState.errors.csrf} />
          )}
          {addAllowanceState.errors.username && (
            <ErrorField errorMsgs={addAllowanceState.errors.username} />
          )}
          {addAllowanceState.errors.slug && (
            <ErrorField errorMsgs={addAllowanceState.errors.slug} />
          )}
          {addAllowanceState.errors.dob && (
            <ErrorField errorMsgs={addAllowanceState.errors.dob} />
          )}

          {fieldErrors.dob && fieldErrors.dob.length > 0 && (
            <ErrorField errorMsgs={fieldErrors.dob} />
          )}
          {fieldErrors.dob && fieldErrors.dob.length > 0 && (
            <div
              className="row"
              style={{ fontSize: "1.5rem", marginTop: "1rem" }}
            >
              Add date of birth to their user profile in the{" "}
              <Link className="locallink" href={`/users`}>
                user table.
              </Link>
            </div>
          )}
          <label>
            Site User{" "}
            <sup>
              <span className="highlight" style={{ fontSize: ".7rem" }}>
                Must be an existing site user
              </span>
            </sup>
          </label>
          <div className="row">
            <select
              name="user-select"
              className="select"
              defaultValue={selectedUser}
              onChange={handleSelect}
            >
              <option key="no-user-selected" value="">
                Select user...
              </option>
              {users.map((u) => (
                <option key={u.slug} value={u.slug}>
                  {u.lastname}, {u.firstname}
                </option>
              ))}
            </select>
          </div>

          <input type="hidden" name="username" value={selectedUsername} />
          <input type="hidden" name="slug" value={selectedUserSlug} />
          <input type="hidden" name="birth_date" value={selectedUserDob} />

          <div className={`row`}>
            <ul style={{ paddingLeft: "1rem" }}>
              <li>
                <em>
                  A remittee may earn <span className="highlight">up to</span>{" "}
                  the dollar amount of their age in years each week.
                </em>
              </li>
            </ul>
          </div>

          <div className={`row`}>
            <FormSubmit
              buttonLabel="Create Allowance"
              pendingLabel="Creating Allowance..."
            />
          </div>
        </form>
      )}

      {addAllowanceState.complete && (
        <div>
          <h2>
            {" "}
            User{" "}
            <span className="highlight">
              {addAllowanceState?.username}&apos;s
            </span>{" "}
            account created!
          </h2>
          <p>
            <ul>
              <li>
                Review{" "}
                {addAllowanceState.allowance_account ? (
                  <Link
                    className="locallink"
                    href={`/allowances/${addAllowanceState.allowance_account}`}
                  >
                    account.
                  </Link>
                ) : (
                  "account."
                )}
              </li>
              <li>
                Add another{" "}
                <Link className="locallink" href={`/allowances/add`}>
                  allowance account.
                </Link>
              </li>

              <li>
                Return to{" "}
                <Link className="locallink" href="/allowances">
                  allowances table.
                </Link>
              </li>
            </ul>
          </p>
        </div>
      )}
    </>
  );
}
