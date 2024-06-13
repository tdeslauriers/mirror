"use client";

import { ChangeEvent, useEffect, useState } from "react";
import styles from "./page.module.css";
import ErrorField from "@/components/error-field";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Credentials } from "../api";

type Err = { [key: string]: string[] };

export default function Login() {
  const [pending, setPending] = useState(false);
  const [credentials, setCredentials] = useState<Credentials>({
    username: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Err>({}); // client side errors
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const params = useSearchParams();
  const path = usePathname();
  const [oauthResponseType, setOauthResponseType] = useState<string | null>(
    null
  );
  const [oauthState, setOauthState] = useState<string | null>(null);
  const [oauthNonce, setOauthNonce] = useState<string | null>(null);
  const [oauthClientId, setOauthClientId] = useState<string | null>(null);
  const [oauthRedirect, setOauthRedirect] = useState<string | null>(null);

  const fetchOauthExchange = async () => {
    try {
      const response = await fetch("/api/login/state", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        return response.json();
      } else {
        const error = await response.json();
        setFieldErrors(error);
        return Promise.reject(error);
      }
    } catch (error) {
      return Promise.reject(error);
    }
  };

  useEffect(() => {
    const response_type = params.get("response_type");
    const state = params.get("state");
    const nonce = params.get("nonce");
    const client_id = params.get("client_id");
    const redirect = params.get("redirect_url");

    if (!response_type || !state || !nonce || !client_id || !redirect) {
      fetchOauthExchange()
        .then(({ response_type, state, nonce, client_id, redirect_url }) => {
          if (state && nonce && redirect_url) {
            setOauthResponseType(response_type);
            setOauthState(state);
            setOauthNonce(nonce);
            setOauthClientId(client_id);
            setOauthRedirect(redirect_url);

            // update url with state and nonce
            router.replace(
              `${path}?client_id=${client_id}&response_type=${response_type}&state=${state}&nonce=${nonce}&redirect_url=${encodeURIComponent(
                redirect_url
              )}`
            );
          }
        })
        .catch((error) => {
          console.error("state-nonce api call failed 2: ", error);
          const errMsg = error.server
            ? error.server
            : "Failed to get state, nonce, and default redirect url.";
          setFieldErrors({
            server: [errMsg, "If error continues, please contact me."],
          });
        });
    } else {
      setOauthResponseType(response_type);
      setOauthState(state);
      setOauthNonce(nonce);
      setOauthClientId(client_id);
      setOauthRedirect(redirect);
    }
  }, [router, params, path]);

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
        const authUrl = `/api/login?client_id=${oauthClientId}&response_type=${oauthResponseType}&state=${oauthState}&nonce=${oauthNonce}&redirect_url=${encodeURIComponent(
          oauthRedirect ?? ""
        )}`;
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
          {fieldErrors.oauth && <ErrorField errorMsgs={fieldErrors.oauth} />}
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
