"use client";

import styles from "./page.module.css";
import { useActionState } from "react";
import { Profile, ProfileActionCmd } from ".";
import ErrorField from "@/components/error-field";
import FormSubmit from "@/components/form-submit";
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from "@/validation/fields";

export default function UserForm({
  csrf,
  profile,
  userEdit,
}: {
  csrf: string;
  profile: Profile;
  userEdit: (
    prevState: ProfileActionCmd,
    formData: FormData
  ) => ProfileActionCmd | Promise<ProfileActionCmd>;
}) {
  const [profileState, formAction] = useActionState(userEdit, {
    csrf: csrf,
    profile: profile,
    errors: {},
  });

  return (
    <>
      <form className={styles.form} action={formAction}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="firstname">
              Firstname
            </label>
            {profileState.errors.firstname && (
              <ErrorField errorMsgs={profileState.errors.firstname} />
            )}
            <input
              className={styles.form}
              name="firstname"
              type="text"
              title="Only letters, hyphens, apostrophes, underscores, and spaces allowed"
              minLength={NAME_MIN_LENGTH}
              maxLength={NAME_MAX_LENGTH}
              pattern={`^[a-zA-Z\\-\'\_\ ]+`}
              defaultValue={profileState.profile?.firstname}
              placeholder="Firstname"
              required
            />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="lastname">
              Lastname
            </label>
            {profileState.errors.lastname && (
              <ErrorField errorMsgs={profileState.errors.lastname} />
            )}
            <input
              className={styles.form}
              name="lastname"
              type="text"
              title="Only letters, hyphens, apostrophes, underscores, and spaces allowed"
              minLength={NAME_MIN_LENGTH}
              maxLength={NAME_MAX_LENGTH}
              pattern={`^[a-zA-Z\\-\'\_\ ]+`}
              defaultValue={profileState.profile?.lastname}
              placeholder="Lastname"
              required
            />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.date}>
            <label
              className={styles.label}
              htmlFor="birthdate"
              title="only required for allowance app"
            >
              Birth date{" "}
              <sup>
                <span
                  className={styles.highlight}
                  style={{ textTransform: "lowercase" }}
                >
                  optional
                </span>
              </sup>
            </label>
            {profileState.errors.birthdate && (
              <ErrorField errorMsgs={profileState.errors.birthdate} />
            )}

            <div className={styles.daterow}>
              <input
                className={styles.birthdate}
                name="birthMonth"
                title="Enter a month number between 1 and 12"
                type="number"
                min={1}
                max={12}
                defaultValue={profileState.profile?.birth_month}
                placeholder="Month"
              />

              <input
                className={styles.birthdate}
                name="birthDay"
                title="Enter a day number between 1 and 31"
                type="number"
                min={1}
                max={31}
                defaultValue={profileState.profile?.birth_day}
                placeholder="Day"
              />

              <input
                className={styles.birthdate}
                name="birthYear"
                title={`Enter a year number between ${
                  new Date().getFullYear() - 120
                } and ${new Date().getFullYear()}`}
                type="number"
                min={new Date().getFullYear() - 120}
                max={new Date().getFullYear()}
                defaultValue={profileState.profile?.birth_year}
                placeholder="Year"
              />
            </div>
          </div>
        </div>
        <div className={styles.row}>
          <FormSubmit
            buttonLabel="update user data"
            pendingLabel="updating user record..."
          />
        </div>
      </form>
    </>
  );
}
