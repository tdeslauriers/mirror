"use client";

import { ChangeEvent, useActionState, useState } from "react";
import ErrorField from "@/components/errors/error-field";
import {
  EMAIL_MAX_LENGTH,
  EMAIL_MIN_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/validation/user_fields";
import Link from "next/link";
import { PasswordEntries, RegistrationActionCmd, validatePasswords } from ".";
import FormSubmit from "@/components/forms/form-submit";

type Err = { [key: string]: string[] };

export default function RegistrationForm({
  csrf,
  handleRegistration,
}: {
  csrf: string;
  handleRegistration: (
    prevState: RegistrationActionCmd,
    formData: FormData
  ) => RegistrationActionCmd | Promise<RegistrationActionCmd>;
}) {
  const [passwords, setPasswords] = useState<PasswordEntries>({});
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Err>({}); // client side errors

  // validate password fields meet requirements
  const handlePwChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setPasswords((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // needed to validate password fields meet requirements
  // because regexes are too complex for html pattern attribute
  const handleOnBlur = () => {
    let errors = validatePasswords(passwords);
    setFieldErrors(errors);
  };

  const [registrationState, formAction] = useActionState(handleRegistration, {
    csrf: csrf,
    complete: false,
    registration: {},
    errors: {},
  });

  return (
    <>
      {!registrationState.complete && (
        <form className={`form`} action={formAction}>
          <div style={{ paddingBottom: "1rem" }}>
            Before registering, make sure to read the{" "}
            <Link
              className="locallink"
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Notice.
            </Link>
          </div>

          {registrationState.errors.server && (
            <ErrorField errorMsgs={registrationState.errors.server} />
          )}
          {registrationState.errors.badrequest && (
            <ErrorField errorMsgs={registrationState.errors.badrequest} />
          )}
          {registrationState.errors.csrf && (
            <ErrorField errorMsgs={registrationState.errors.csrf} />
          )}
          <input
            type="hidden"
            name="csrfToken"
            value={registrationState.registration?.csrf}
          />
          <div className={`row`}>
            <div className={`field`}>
              <label className={`label`} htmlFor="username">
                email
              </label>
              {registrationState.errors.username && (
                <ErrorField errorMsgs={registrationState.errors.username} />
              )}
              <input
                className={`form`}
                type="text"
                name="username"
                title="Must be a valid email address"
                minLength={EMAIL_MIN_LENGTH}
                maxLength={EMAIL_MAX_LENGTH}
                pattern={`^[a-zA-Z0-9\_\.\+\\-]+@[a-zA-Z0-9\\-]+\\.[a-zA-Z]+`}
                defaultValue={registrationState.registration?.username}
                placeholder="Email"
                required
              />
            </div>
          </div>
          <div className={`row`}>
            <div className={`field`}>
              <label className={`label`} htmlFor="password">
                Password
              </label>
              {fieldErrors.password && (
                <ErrorField errorMsgs={fieldErrors.password} />
              )}
              {registrationState.errors.password && (
                <ErrorField errorMsgs={registrationState.errors.password} />
              )}
              <input
                className={`form`}
                type={showPassword ? "text" : "password"}
                name="password"
                title={`Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters long.`}
                minLength={PASSWORD_MIN_LENGTH}
                maxLength={PASSWORD_MAX_LENGTH}
                defaultValue={registrationState.registration?.password}
                placeholder="Password"
                onChange={handlePwChange}
                onBlur={handleOnBlur}
                required
              />
            </div>
          </div>
          <div className={`row`}>
            <div className={`field`}>
              <label className={`label`} htmlFor="confirm_password">
                Confirm Password
              </label>
              {fieldErrors.confirm_password && (
                <ErrorField errorMsgs={fieldErrors.confirm_password} />
              )}
              {registrationState.errors.confirm_password && (
                <ErrorField
                  errorMsgs={registrationState.errors.confirm_password}
                />
              )}
              <input
                className={`form`}
                type={showPassword ? "text" : "password"}
                name="confirm_password"
                title="Passwords must match"
                minLength={PASSWORD_MIN_LENGTH}
                maxLength={PASSWORD_MAX_LENGTH}
                defaultValue={registrationState.registration?.confirm_password}
                placeholder="Confirm Password"
                onChange={handlePwChange}
                onBlur={handleOnBlur}
                required
              />
            </div>
          </div>
          <div className={`row`}>
            <div className={`field`}>
              <input
                className={`showpassword`}
                type="checkbox"
                checked={showPassword}
                name="show"
                onChange={toggleShowPassword}
              />
              <label className={`label`} htmlFor="password">
                Show Password
              </label>
            </div>
          </div>

          <br />

          <div className={`row`}>
            <div className={`field`}>
              <label className={`label`} htmlFor="firstname">
                Firstname
              </label>
              {registrationState.errors.firstname && (
                <ErrorField errorMsgs={registrationState.errors.firstname} />
              )}
              <input
                className={`form`}
                name="firstname"
                type="text"
                title="Only letters, hyphens, apostrophes, underscores, and spaces allowed"
                minLength={NAME_MIN_LENGTH}
                maxLength={NAME_MAX_LENGTH}
                pattern={`^[a-zA-Z\\-\'\_\ ]+`}
                defaultValue={registrationState.registration?.firstname}
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
              {registrationState.errors.lastname && (
                <ErrorField errorMsgs={registrationState.errors.lastname} />
              )}
              <input
                className={`form`}
                name="lastname"
                type="text"
                title="Only letters, hyphens, apostrophes, underscores, and spaces allowed"
                minLength={NAME_MIN_LENGTH}
                maxLength={NAME_MAX_LENGTH}
                pattern={`^[a-zA-Z\\-\'\_\ ]+`}
                defaultValue={registrationState.registration?.lastname}
                placeholder="Lastname"
                required
              />
            </div>
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
                    optional
                  </span>
                </sup>
              </label>
              {registrationState.errors.birthdate && (
                <ErrorField errorMsgs={registrationState.errors.birthdate} />
              )}

              <div className={`daterow`}>
                <input
                  className={`birthdate`}
                  name="birthMonth"
                  title="Enter a month number between 1 and 12"
                  type="number"
                  min={1}
                  max={12}
                  defaultValue={registrationState.registration?.birthMonth}
                  placeholder="Month"
                />

                <input
                  className={`birthdate`}
                  name="birthDay"
                  title="Enter a day number between 1 and 31"
                  type="number"
                  min={1}
                  max={31}
                  defaultValue={registrationState.registration?.birthDay}
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
                  defaultValue={registrationState.registration?.birthYear}
                  placeholder="Year"
                />
              </div>
            </div>
          </div>

          <div className={`row`} style={{ paddingTop: "1rem" }}>
            <FormSubmit buttonLabel="register" pendingLabel="registering..." />
          </div>
        </form>
      )}

      {registrationState.complete && (
        <>
          <div>
            <h2>
              <span className={`highlight`}>Registration successful!</span>
            </h2>
            <p>
              Thanks for signing up,{" "}
              <span className={`highlight`}>
                {registrationState.registration?.firstname}
              </span>
              . Proceed to the{" "}
              <Link className={`locallink`} href="/login">
                login
              </Link>{" "}
              page, use{" "}
              <span className={`highlight`}>
                {registrationState.registration?.username}
              </span>{" "}
              as your username, and enter your password.
            </p>
            <h3>
              <span className={`highlight`}>Note:</span>
            </h3>
            <ul>
              <li>
                While you have an account and will be able to view your profile
                and other less sensitive content, you will not be able to view
                restricted content immediately.
              </li>
              <li>
                I still need to provision you access to various resources. I
                will send you an email when you have been granted access.
              </li>
            </ul>
          </div>
        </>
      )}
    </>
  );
}
