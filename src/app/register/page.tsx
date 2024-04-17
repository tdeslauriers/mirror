"use client";

import styles from "./page.module.css";
import { handleRegister } from "@/actions/register";
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
                <div className={styles.error}>{state.errors.username}</div>
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
                <div className={styles.error}>{state.errors.password}</div>
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
                <div className={styles.error}>
                  {state.errors.confirm_password}
                </div>
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
                <div className={styles.error}>{state.errors.firstname}</div>
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
                <div className={styles.error}>{state.errors.lastname}</div>
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
              <label className={styles.label} htmlFor="birthdate">
                Birthdate
              </label>
              {state?.errors?.dobIncomplete && (
                <div className={styles.error}>{state.errors.dobIncomplete}</div>
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
                {pending ? "Registering..." : "Register"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
