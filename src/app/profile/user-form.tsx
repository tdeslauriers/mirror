"use client";

import styles from "./page.module.css";
import { useActionState } from "react";
import { Profile, ProfileActionCmd } from ".";
import ErrorField from "@/components/error-field";

export default function UserForm({
  profile,
  userEdit,
}: {
  profile: Profile;
  userEdit: (
    prevState: ProfileActionCmd,
    formData: FormData
  ) => ProfileActionCmd | Promise<ProfileActionCmd>;
}) {
  const [profileState, formAction] = useActionState(userEdit, {
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
              type="text"
              name="firstname"
              defaultValue={profileState.profile?.firstname}
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
              type="text"
              name="lastname"
              defaultValue={profileState.profile?.lastname}
              required
            />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.actions}>
            <button type="submit">Update</button>
          </div>
        </div>
      </form>
    </>
  );
}
