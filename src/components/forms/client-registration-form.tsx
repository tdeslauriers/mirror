"use client";

import { ChangeEvent, useActionState, useState } from "react";
import { ClientRegisterActionCmd } from ".";
import ErrorField from "../errors/error-field";
import {
  SERVICENAME_MAX_LENGTH,
  SERVICENAME_MIN_LENGTH,
} from "@/validation/service_client_field";
import FormSubmit from "./form-submit";
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/validation/user_fields";
import { PasswordEntries, validatePasswords } from "@/app/register";
import Link from "next/link";

type Err = { [key: string]: string[] };

export default function ClientRegistrationForm({
  csrf,
  handleClientRegister,
}: {
  csrf: string;
  handleClientRegister: (
    prevState: ClientRegisterActionCmd,
    formData: FormData
  ) => ClientRegisterActionCmd | Promise<ClientRegisterActionCmd>;
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

  const [clientState, formAction] = useActionState(handleClientRegister, {
    csrf: csrf,
    complete: false,
    registration: {},
    errors: {},
  });
  return (
    <>
      {!clientState.complete && (
        <form className="form" action={formAction}>
          {clientState.errors.server && (
            <ErrorField errorMsgs={clientState.errors.server} />
          )}

          <div className="row">
            <div className="field">
              <label className="label" htmlFor="name">
                Service Name
              </label>
              {clientState.errors.name && (
                <ErrorField errorMsgs={clientState.errors.name} />
              )}
              <input
                className="form"
                name="name"
                type="text"
                minLength={SERVICENAME_MIN_LENGTH}
                maxLength={SERVICENAME_MAX_LENGTH}
                pattern="[a-z ]+" // only lowercase letters
                defaultValue={clientState.registration?.name}
                placeholder="Service Name"
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="field">
              <label className="label" htmlFor="owner">
                Owner
              </label>
              {clientState.errors.owner && (
                <ErrorField errorMsgs={clientState.errors.owner} />
              )}
              <input
                className="form"
                name="owner"
                type="text"
                minLength={NAME_MIN_LENGTH}
                maxLength={NAME_MAX_LENGTH}
                pattern={`^[a-zA-Z\\-\'\_\ ]+`}
                defaultValue={clientState.registration?.owner}
                placeholder="Owner"
                required
              />
            </div>
          </div>

          {/* password */}
          <div className={`row`}>
            <div className={`field`}>
              <label className={`label`} htmlFor="password">
                Password
              </label>
              {fieldErrors.password && (
                <ErrorField errorMsgs={fieldErrors.password} />
              )}
              {clientState.errors.password && (
                <ErrorField errorMsgs={clientState.errors.password} />
              )}
              <input
                className={`form`}
                type={showPassword ? "text" : "password"}
                name="password"
                title={`Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters long.`}
                minLength={PASSWORD_MIN_LENGTH}
                maxLength={PASSWORD_MAX_LENGTH}
                defaultValue={clientState.registration?.password}
                placeholder="Password"
                onChange={handlePwChange}
                onBlur={handleOnBlur}
                required
              />
            </div>
          </div>

          {/* confirm password */}
          <div className={`row`}>
            <div className={`field`}>
              <label className={`label`} htmlFor="confirm_password">
                Confirm Password
              </label>
              {fieldErrors.confirm_password && (
                <ErrorField errorMsgs={fieldErrors.confirm_password} />
              )}
              {clientState.errors.confirm_password && (
                <ErrorField errorMsgs={clientState.errors.confirm_password} />
              )}
              <input
                className={`form`}
                type={showPassword ? "text" : "password"}
                name="confirm_password"
                title="Passwords must match"
                minLength={PASSWORD_MIN_LENGTH}
                maxLength={PASSWORD_MAX_LENGTH}
                defaultValue={clientState.registration?.confirm_password}
                placeholder="Confirm Password"
                onChange={handlePwChange}
                onBlur={handleOnBlur}
                required
              />
            </div>
          </div>

          {/* show password checkbox */}
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

          {/* submit button */}
          <div className="row" style={{ marginTop: "1.5rem" }}>
            <FormSubmit
              buttonLabel="Register Service"
              pendingLabel="Registering Service..."
            />
          </div>
        </form>
      )}

      {clientState.complete && (
        <div>
          <h2>
            <span className="highlight">{clientState.registration?.name}</span>{" "}
            service registration successful!
          </h2>
          <p>
            <ul>
              <li>
                To view the service or make changes click here:{" "}
                <Link
                  className="locallink"
                  href={`/services/${clientState.registration?.slug}`}
                >
                  {clientState.registration?.name}
                </Link>
                .
              </li>
              <li>
                Return to{" "}
                <Link className="locallink" href="/services">
                  Services
                </Link>
                .
              </li>
            </ul>
          </p>
        </div>
      )}
    </>
  );
}
