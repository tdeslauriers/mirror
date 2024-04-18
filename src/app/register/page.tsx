"use client";

import styles from "./page.module.css";
import { handleRegister } from "@/actions/register";
import ErrorField from "@/components/error-field";
import { useFormState, useFormStatus } from "react-dom";

export default function Register() {
  const { pending } = useFormStatus();
  const [state, formAction] = useFormState(handleRegister, undefined);
  return (
    <>
      <header className={styles.header}>
        <h1>
          <span className={styles.highlight}>Sign up</span> for an account.
        </h1>
      </header>
      <main className={styles.header}>
        <form className={styles.form} action={formAction}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="username">
                email
              </label>
              {state?.errors?.username && (
                <ErrorField errorMsg={state.errors.username} />
              )}
              <input
                className={styles.form}
                type="text"
                id="username"
                name="username"
                required
              />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                Password
              </label>
              {state?.errors?.password && (
                <ErrorField errorMsg={state.errors.password} />
              )}
              <input
                className={styles.form}
                type="password"
                id="password"
                name="password"
                required
              />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="confirm_password">
                Confirm Password
              </label>
              {state?.errors?.confirm_password && (
                <ErrorField errorMsg={state.errors.confirm_password} />
              )}
              <input
                className={styles.form}
                type="password"
                id="confirm_password"
                name="confirm_password"
                required
              />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="firstname">
                Firstname
              </label>
              {state?.errors?.firstname && (
                <ErrorField errorMsg={state.errors.firstname} />
              )}
              <input
                className={styles.form}
                type="text"
                id="firstname"
                name="firstname"
                required
              />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="lastname">
                Lastname
              </label>
              {state?.errors?.lastname && (
                <ErrorField errorMsg={state.errors.lastname} />
              )}
              <input
                className={styles.form}
                type="text"
                id="lastname"
                name="lastname"
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
              {state?.errors?.dobIncomplete && (
                <ErrorField errorMsg={state.errors.dobIncomplete} />
              )}
              {state?.errors?.dobInvalid && (
                <div className={styles.error}>{state.errors.dobInvalid}</div>
              )}
              <div className={styles.daterow}>
                <select
                  className={styles.birthdate}
                  id="birthMonth"
                  name="birthMonth"
                >
                  <option value="">Month</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                <select
                  className={styles.birthdate}
                  id="birthDay"
                  name="birthDay"
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
          {state?.errors && (
            <div className={styles.row}>
              <div className={styles.field}>
                <ErrorField errorMsg="Registration error(s): please correct and re-submit." />
              </div>
            </div>
          )}
        </form>
      </main>
    </>
  );
}
