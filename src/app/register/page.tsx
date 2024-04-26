"use client";

import { ChangeEvent, useState } from "react";
import styles from "./page.module.css";
import ErrorField from "@/components/error-field";
import {
  FieldValidation,
  checkEmail,
  checkName,
  checkPassword,
} from "@/validation/profile";

// different from server side registration object
// server side concatenates birthdate into a single string
// after validation
type Registration = {
  username: string;
  password: string;
  confirm_password: string;
  firstname: string;
  lastname: string;
  birthMonth?: string;
  birthDay?: string;
  birthYear?: string;
};

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
  const [pending, setPending] = useState(false);
  const [registration, setRegistration] = useState<Registration>({
    username: "",
    password: "",
    confirm_password: "",
    firstname: "",
    lastname: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Err>({}); // client side errors

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
    const errors = validateRegistration(registration);
    setFieldErrors(errors);
  };

  return (
    <>
      <header className={styles.header}>
        <h1>
          <span className={styles.highlight}>Sign up</span> for an account.
        </h1>
      </header>
      <main className={styles.header}>
        <form className={styles.form}>
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
                  {[...Array(new Date().getFullYear() - 1900)].map((_, i) => (
                    <option key={i} value={i + 1901}>
                      {i + 1901}
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
      </main>
    </>
  );
}

function validateRegistration(registration: Registration) {
  const errors: { [key: string]: string[] } = {};

  // username
  if (registration.username.length > 0) {
    const usernameCheck: FieldValidation = checkEmail(registration.username);
    if (!usernameCheck.isValid) {
      errors.username = usernameCheck.messages;
    }
  }

  // password
  if (registration.password.length > 0) {
    const passwordCheck: FieldValidation = checkPassword(registration.password);
    if (!passwordCheck.isValid) {
      errors.password = passwordCheck.messages;
    }
  }

  // confirm_password: check if matches password
  if (registration.confirm_password.length > 0) {
    if (registration.password !== registration.confirm_password) {
      errors.confirm_password = ["Passwords do not match."];
    }
  }

  // check firstname
  if (registration.firstname.length > 0) {
    const firstnameCheck: FieldValidation = checkName(registration.firstname);
    if (!firstnameCheck.isValid) {
      errors.firstname = firstnameCheck.messages;
    }
  }

  // check lastname
  if (registration.lastname.length > 0) {
    const lastnameCheck: FieldValidation = checkName(registration.lastname);
    if (!lastnameCheck.isValid) {
      errors.lastname = lastnameCheck.messages;
    }
  }

  // only check if all birthdate fields are filled on submit
  return errors;
}
