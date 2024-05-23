"use client";

import { ChangeEvent, useState } from "react";
import styles from "./page.module.css";
import { Credentials } from "@/validation/profile";
import ErrorField from "@/components/error-field";

type Err = { [key: string]: string[] };

export default function Login() {
  const [pending, setPending] = useState(false);
  const [credentials, setCredentials] = useState<Credentials>({
    username: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Err>({}); // client side errors
  const [showPassword, setShowPassword] = useState(false);

  const handleFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleOnBlur = () => {
    let errors = validateLogin(credentials); // field level validation
    setFieldErrors(errors);
  };

  const handleSubmit = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    // field level validation
    let errors = validateLogin(credentials);
    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      setPending(true);
      // post to login api
      try {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        });

        if (response.ok) {
          setPending(false);
          // TODO: handle redirect to home or restricted url content
        } else {
          const fail = await response.json();
          setFieldErrors(fail);
          setPending(false);
        }
      } catch (error) {
        // handle network error
        console.error("Login api call failed: ", error);
        setPending(false);
      }
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <header className={styles.header}>
        <h1>
          <span className={styles.highlight}>Login</span> to view restricted
          content.
        </h1>
      </header>
      <main className={styles.header}>
        <form className={styles.form} onSubmit={handleSubmit}>
          {fieldErrors.server && <ErrorField errorMsgs={fieldErrors.server} />}
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
                type={showPassword ? "text" : "password"}
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
              <input
                className={styles.showpassword}
                type="checkbox"
                checked={showPassword}
                name="show"
                onChange={toggleShowPassword}
              />
              <label className={styles.label} htmlFor="password">
                Show Password
              </label>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.actions}>
              <button type="submit" disabled={pending}>
                {pending ? (
                  <>
                    <strong>Logging in...</strong>
                  </>
                ) : (
                  <>
                    <strong>Login</strong>
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

function validateLogin(creds: Credentials): Err {
  const errors: { [key: string]: string[] } = {};

  // check username for field level errors
  if (creds.username.trim().length > 254) {
    errors.username = ["Email/username must be less than 254 characters."];
  }

  // check password for field level errors
  if (creds.password.trim().length > 64) {
    errors.password = ["Password must be less than 64 characters."];
  }

  return errors;
}
