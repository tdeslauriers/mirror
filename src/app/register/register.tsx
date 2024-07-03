"use client";

import { ChangeEvent, useState, useEffect } from "react";
import styles from "./page.module.css";
import ErrorField from "@/components/error-field";
import {
  FieldValidation,
  checkEmail,
  checkName,
  checkPassword,
} from "@/validation/fields";
import Link from "next/link";
import { Registration } from "../api";
import useCsrfToken from "@/components/csrf";

type Err = { [key: string]: string[] };

const months: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function Register() {
  const [registrationSuccess, setRegistrationSuccess] =
    useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);
  const [registration, setRegistration] = useState<Registration>({
    username: "",
    password: "",
    confirm_password: "",
    firstname: "",
    lastname: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Err>({}); // client side errors

  const csrfToken = useCsrfToken();

  // data entry
  const handleFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setRegistration((prevRegistration) => ({
      ...prevRegistration,
      [name]: value,
    }));
  };

  const handleOnBlur = () => {
    let errors = validateRegistration(registration);

    if (
      (fieldErrors.dobIncomplete?.length > 0 &&
        !registration.birthMonth &&
        !registration.birthDay &&
        !registration.birthYear) ||
      (fieldErrors.dobIncomplete?.length > 0 &&
        registration.birthMonth &&
        registration.birthDay &&
        registration.birthYear)
    ) {
      delete errors.dobIncomplete;
    }
    setFieldErrors(errors);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // check for errors
    let errors = validateRegistration(registration);
    setFieldErrors(errors);
    if (
      (registration.birthMonth &&
        (!registration.birthDay || !registration.birthYear)) ||
      (registration.birthDay &&
        (!registration.birthMonth || !registration.birthYear)) ||
      (registration.birthYear &&
        (!registration.birthMonth || !registration.birthDay))
    ) {
      errors.dobIncomplete = ["Please fill out all birthdate fields."];
    }

    if (Object.keys(errors).length === 0) {
      setPending(true);

      // append csrf token to registration object
      if (csrfToken) {
        registration.csrf = csrfToken;
      }

      // make api call
      try {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registration),
        });

        if (response.ok) {
          const success = await response.json();
          setPending(false);
          setRegistration(success);
          setRegistrationSuccess(true);
        } else {
          const fail = await response.json();
          setFieldErrors(fail);
          setPending(false);
        }
      } catch (error) {
        // handle network error
        console.error("Registration api call failed: ", error);
        setPending(false);
      }
    }
  };

  return (
    <>
      <main className={styles.main}>
        {!registrationSuccess && (
          <form className={styles.form} onSubmit={handleSubmit}>
            {fieldErrors.server && (
              <ErrorField errorMsgs={fieldErrors.server} />
            )}
            {fieldErrors.badrequest && (
              <ErrorField errorMsgs={fieldErrors.badrequest} />
            )}
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="username">
                  email
                </label>
                {fieldErrors.username && (
                  <ErrorField errorMsgs={fieldErrors.username} />
                )}
                <input
                  className={styles.form}
                  type="text"
                  id="username"
                  name="username"
                  required
                  onChange={handleFieldChange}
                  onBlur={handleOnBlur}
                />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="password">
                  Password
                </label>
                {fieldErrors.password && (
                  <ErrorField errorMsgs={fieldErrors.password} />
                )}
                <input
                  className={styles.form}
                  type="password"
                  id="password"
                  name="password"
                  required
                  onChange={handleFieldChange}
                  onBlur={handleOnBlur}
                />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="confirm_password">
                  Confirm Password
                </label>
                {fieldErrors.confirm_password && (
                  <ErrorField errorMsgs={fieldErrors.confirm_password} />
                )}
                <input
                  className={styles.form}
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  required
                  onChange={handleFieldChange}
                  onBlur={handleOnBlur}
                />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="firstname">
                  Firstname
                </label>
                {fieldErrors.firstname && (
                  <ErrorField errorMsgs={fieldErrors.firstname} />
                )}
                <input
                  className={styles.form}
                  type="text"
                  id="firstname"
                  name="firstname"
                  required
                  onChange={handleFieldChange}
                  onBlur={handleOnBlur}
                />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="lastname">
                  Lastname
                </label>
                {fieldErrors.lastname && (
                  <ErrorField errorMsgs={fieldErrors.lastname} />
                )}
                <input
                  className={styles.form}
                  type="text"
                  id="lastname"
                  name="lastname"
                  required
                  onChange={handleFieldChange}
                  onBlur={handleOnBlur}
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
                {fieldErrors.dobIncomplete && (
                  <ErrorField errorMsgs={fieldErrors.dobIncomplete} />
                )}

                <div className={styles.daterow}>
                  <select
                    className={styles.birthdate}
                    id="birthMonth"
                    name="birthMonth"
                    onChange={handleFieldChange}
                    onBlur={handleOnBlur}
                  >
                    <option value="">Month</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i} value={i + 1}>
                        {months[i]}
                      </option>
                    ))}
                  </select>
                  <select
                    className={styles.birthdate}
                    id="birthDay"
                    name="birthDay"
                    onChange={handleFieldChange}
                    onBlur={handleOnBlur}
                  >
                    <option value="">Day</option>
                    {[...Array(31)].map((_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <select
                    className={styles.birthdate}
                    id="birthYear"
                    name="birthYear"
                    onChange={handleFieldChange}
                    onBlur={handleOnBlur}
                  >
                    <option value="">Year</option>
                    {Array.from(
                      { length: new Date().getFullYear() - 1900 + 1 },
                      (_, i) => new Date().getFullYear() - i
                    ).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.actions}>
                <button type="submit" disabled={pending}>
                  {pending ? (
                    <>
                      <strong>Registering...</strong>
                    </>
                  ) : (
                    <>
                      <strong>Register</strong>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
        {registrationSuccess && (
          <>
            <div className={styles.card}>
              <h2>
                <span className={styles.highlight}>
                  Registration successful!
                </span>
              </h2>
              <p>
                Thanks for signing up,{" "}
                <span className={styles.highlight}>
                  {registration.firstname}
                </span>
                . Proceed to the{" "}
                <Link className={styles.locallink} href="/login">
                  login
                </Link>{" "}
                page, use{" "}
                <span className={styles.highlight}>
                  {registration.username}
                </span>{" "}
                as your username, and enter your password.
              </p>
              <h3>
                <span className={styles.highlight}>Note:</span>
              </h3>
              <ul>
                <li>
                  While you have an account and will be able to view your
                  profile and other less sensitive content, you will not be able
                  to view restricted content immediately.
                </li>
                <li>
                  I still need to provision you access to various resources. I
                  will send you an email when you have been granted access.
                </li>
              </ul>
            </div>
          </>
        )}
      </main>
    </>
  );
}

function validateRegistration(registration: Registration) {
  const errors: { [key: string]: string[] } = {};

  // username
  if (registration.username.trim().length > 0) {
    const usernameCheck: FieldValidation = checkEmail(registration.username);
    if (!usernameCheck.isValid) {
      errors.username = usernameCheck.messages;
    }
  }

  // password
  if (registration.password.trim().length > 0) {
    const passwordCheck: FieldValidation = checkPassword(registration.password);
    if (!passwordCheck.isValid) {
      errors.password = passwordCheck.messages;
    }
  }

  // confirm_password: check if matches password
  if (registration.confirm_password.trim().length > 0) {
    if (registration.password !== registration.confirm_password) {
      errors.confirm_password = ["Passwords do not match."];
    }
  }

  // check firstname
  if (registration.firstname.trim().length > 0) {
    const firstnameCheck: FieldValidation = checkName(registration.firstname);
    if (!firstnameCheck.isValid) {
      errors.firstname = firstnameCheck.messages;
    }
  }

  // check lastname
  if (registration.lastname.trim().length > 0) {
    const lastnameCheck: FieldValidation = checkName(registration.lastname);
    if (!lastnameCheck.isValid) {
      errors.lastname = lastnameCheck.messages;
    }
  }

  // only check if all birthdate fields are filled on submit
  return errors;
}
