"use client";

import styles from "./page.module.css";
import { ChangeEvent, useState } from "react";
import { Credentials } from "../api";
import ErrorField from "@/components/error-field";
import useCsrfToken from "@/components/csrf";
import useOuathExchange from "@/components/oauth";

export default function Login() {
  const [pending, setPending] = useState(false);
  const [credentials, setCredentials] = useState<Credentials>({
    username: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Err>({}); // client side errors
  const [showPassword, setShowPassword] = useState(false);

  // Csrf token
  const csrfToken = useCsrfToken();

  // oauth state, nonce, client_id, and redirect_url
  const oauth = useOuathExchange();

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

      // append csrf token to credentials
      if (csrfToken) {
        credentials.csrf = csrfToken;
      }

      // post to login api
      try {
        // const authUrl = `/api/login?client_id=${oauthClientId}&response_type=${oauthResponseType}&state=${oauthState}&nonce=${oauthNonce}&redirect_url=${encodeURIComponent(
        //   oauthRedirect ?? ""
        // )}`;
        const authUrl = `/api/login?client_id=${
          oauth?.client_id
        }&response_type=${oauth?.response_type}&state=${oauth?.state}&nonce=${
          oauth?.nonce
        }&redirect_url=${encodeURIComponent(oauth?.redirect_url ?? "")}`;
        const response = await fetch(authUrl, {
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
      <form className={styles.form} onSubmit={handleSubmit}>
        {fieldErrors.server && <ErrorField errorMsgs={fieldErrors.server} />}
        {fieldErrors.badrequest && (
          <ErrorField errorMsgs={fieldErrors.badrequest} />
        )}
        {fieldErrors.oauth && <ErrorField errorMsgs={fieldErrors.oauth} />}
        {fieldErrors.credentials && (
          <ErrorField errorMsgs={fieldErrors.credentials} />
        )}
        {fieldErrors.response_type && (
          <ErrorField errorMsgs={fieldErrors.response_type} />
        )}
        {fieldErrors.state && <ErrorField errorMsgs={fieldErrors.state} />}
        {fieldErrors.nonse && <ErrorField errorMsgs={fieldErrors.nonse} />}
        {fieldErrors.redirect && <ErrorField errorMsgs={fieldErrors.nonse} />}
        {fieldErrors.client_id && (
          <ErrorField errorMsgs={fieldErrors.client_id} />
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
    </>
  );
}

type Err = { [key: string]: string[] };

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
