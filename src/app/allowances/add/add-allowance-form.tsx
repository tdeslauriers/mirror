"use client";

import { User } from "@/app/users";
import FormSubmit from "@/components/forms/form-submit";
import Link from "next/link";
import { useState } from "react";

type Err = { [key: string]: string[] };

export default function AddAllowanceForm({
  csrf,
  users,
}: {
  csrf: string;
  users: User[];
}) {
  const [selectedUser, setSelectedUser] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // set the value of the selector to the selected user
    setSelectedUser(e.target.value);

    // get the selected user and set state so we can use it in the form
    const user = users.find((u) => u.slug === e.target.value);
    if (user) {
      setUser(user);
    }
  };

  return (
    <>
      <form className="form">
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
            value={selectedUser}
            onChange={handleSelect}
          >
            <option value="">Select user...</option>
            {users.map((u) => (
              <option key={u.slug} value={u.slug}>
                {u.lastname}, {u.firstname}
              </option>
            ))}
          </select>
        </div>

        <div className={`row`}>
          <div className={`date`}>
            <label
              className={`label`}
              htmlFor="birthdate"
              title="only required for allowance app"
            >
              Birth date{" "}
              <sup>
                <span className={`highlight`} style={{ fontSize: ".7rem" }}>
                  Required for allowance remittance calculation.
                </span>
              </sup>
            </label>
            <div className={`daterow`}>
              <input
                className={`birthdate`}
                name="birthMonth"
                title="Enter a month number between 1 and 12"
                type="number"
                min={1}
                max={12}
                defaultValue={user?.birth_month}
                placeholder="Month"
              />

              <input
                className={`birthdate`}
                name="birthDay"
                title="Enter a day number between 1 and 31"
                type="number"
                min={1}
                max={31}
                defaultValue={user?.birth_day}
                placeholder="Day"
              />

              <input
                className={`birthdate`}
                name="birthYear"
                title={`Enter a year number between ${
                  new Date().getFullYear() - 120
                } and ${new Date().getFullYear()}`}
                type="number"
                min={new Date().getFullYear() - 120}
                max={new Date().getFullYear()}
                defaultValue={user?.birth_year}
                placeholder="Year"
              />
            </div>

            <ul style={{ fontSize: ".75rem", paddingLeft: "1rem" }}>
              <li>
                A remittee may earn up to the amount of their age in years each
                week.
              </li>
              <li>
                Once allownace account created, the remittee's age will appear
                in their{" "}
                {user?.slug ? (
                  <Link className="locallink" href={`/users/${user.slug}`}>
                    user profile
                  </Link>
                ) : (
                  "user profile"
                )}
                .
              </li>
            </ul>
          </div>
        </div>

        <div className={`row`}>
          <FormSubmit
            buttonLabel="Create Allowance"
            pendingLabel="Creating Allowance..."
          />
        </div>
      </form>
    </>
  );
}
