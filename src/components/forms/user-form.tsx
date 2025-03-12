"use client";

import { useActionState } from "react";
import { Profile, ProfileActionCmd } from "../../app/profile";
import ErrorField from "@/components/errors/error-field";
import FormSubmit from "@/components/forms/form-submit";
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from "@/validation/user_fields";
import { User } from "../../app/users";
import { useParams } from "next/navigation";

export default function UserForm({
  csrf,
  slug,
  profile,
  userEdit,
}: {
  csrf: string;
  slug?: string;
  profile: Profile | User;
  userEdit: (
    prevState: ProfileActionCmd,
    formData: FormData
  ) => ProfileActionCmd | Promise<ProfileActionCmd>;
}) {
  const [profileState, formAction] = useActionState(userEdit, {
    csrf: csrf,
    slug: slug,
    profile: profile,
    errors: {},
  });

  const age =
    profile.birth_year && profile.birth_month && profile.birth_day
      ? getAge(profile.birth_year, profile.birth_month, profile.birth_day)
      : null;

  return (
    <>
      <form className={`form`} action={formAction}>
        {profileState.errors.server && (
          <ErrorField errorMsgs={profileState.errors.server} />
        )}

        <div className={`row`}>
          <div className={`field`}>
            <label className={`label`} htmlFor="firstname">
              Firstname
            </label>
            {profileState.errors.firstname && (
              <ErrorField errorMsgs={profileState.errors.firstname} />
            )}
            <input
              className={`form`}
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

        <div className={`row`}>
          <div className={`field`}>
            <label className={`label`} htmlFor="lastname">
              Lastname
            </label>
            {profileState.errors.lastname && (
              <ErrorField errorMsgs={profileState.errors.lastname} />
            )}
            <input
              className={`form`}
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

        {age && (
          <>
            <h2 style={{ paddingBottom: "0.5rem", paddingTop: "rem" }}>
              Age: <span className={`highlight`}>{age}</span>
            </h2>
          </>
        )}

        <div className={`row`}>
          <div className={`date`}>
            <label
              className={`label`}
              htmlFor="birthdate"
              title="only required for allowance app"
            >
              Birth date{" "}
              <sup>
                <span
                  className={`highlight`}
                  style={{ textTransform: "lowercase" }}
                >
                  optional
                </span>
              </sup>
            </label>
            {profileState.errors.birthdate && (
              <ErrorField errorMsgs={profileState.errors.birthdate} />
            )}

            <div className={`daterow`}>
              <input
                className={`birthdate`}
                name="birthMonth"
                title="Enter a month number between 1 and 12"
                type="number"
                min={1}
                max={12}
                defaultValue={profileState.profile?.birth_month}
                placeholder="Month"
              />

              <input
                className={`birthdate`}
                name="birthDay"
                title="Enter a day number between 1 and 31"
                type="number"
                min={1}
                max={31}
                defaultValue={profileState.profile?.birth_day}
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
                defaultValue={profileState.profile?.birth_year}
                placeholder="Year"
              />
            </div>
          </div>
        </div>

        {profileState.slug && (
          <div className="checkbox-row">
            
              <div className="field">
                <label className="label" htmlFor="enabled">
                  Enabled
                </label>
                {profileState.errors.enabled && (
                  <ErrorField errorMsgs={profileState.errors.enabled} />
                )}
                <input
                  className="form"
                  name="enabled"
                  type="checkbox"
                  defaultChecked={profileState.profile?.enabled}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="account_expired">
                  Account Expired
                </label>
                {profileState.errors.account_expired && (
                  <ErrorField errorMsgs={profileState.errors.account_expired} />
                )}
                <input
                  className="form"
                  name="account_expired"
                  type="checkbox"
                  defaultChecked={profileState.profile?.account_expired}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="account_locked">
                  Account Locked
                </label>
                {profileState.errors.account_locked && (
                  <ErrorField errorMsgs={profileState.errors.account_locked} />
                )}
                <input
                  className="form"
                  name="account_locked"
                  type="checkbox"
                  defaultChecked={profileState.profile?.account_locked}
                />
              </div>
            
          </div>
        )}

        <div className={`row`} style={{ marginTop: "1.5rem" }}>
          <FormSubmit
            buttonLabel="update profile data"
            pendingLabel="updating profile record..."
          />
        </div>
      </form>
    </>
  );
}

function getAge(year: number, month: number, day: number): number {
  const today = new Date(); // current date
  const birth = new Date(year, month, day);

  let age = today.getFullYear() - birth.getFullYear();

  // check if the birthday hasn't occurred yet this year
  const monthDiff = today.getMonth() - birth.getMonth();
  const dayDiff = today.getDate() - birth.getDate();

  // if it hasn't, subtract a year from the age
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}
