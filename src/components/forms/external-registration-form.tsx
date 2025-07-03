"use client";

import { ChangeEvent, useActionState, useState } from "react";
import ErrorField from "../errors/error-field";
import { ExternalRegisterActionCmd } from "@/app/externals";
import { SERVICENAME_MIN_LENGTH } from "@/validation/service_client_field";
import { PasswordEntries, validatePasswords } from "@/app/register";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/validation/user_fields";
import FormSubmit from "./form-submit";

type Err = { [key: string]: string[] };

export default function ExternalRegistrationForm({
  csrf,
  handleExternalRegister,
}: {
  csrf: string;
  handleExternalRegister: (
    prevState: ExternalRegisterActionCmd,
    formData: FormData
  ) => ExternalRegisterActionCmd | Promise<ExternalRegisterActionCmd>;
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

  const [externalState, formAction] = useActionState(handleExternalRegister, {
    csrf: csrf,
    complete: false,
    registration: {},
    errors: {},
  });

  return (
    <>
      {!externalState.complete && (
        <form className="form" action={formAction}>
          {externalState.errors.server && (
            <ErrorField errorMsgs={externalState.errors.server} />
          )}

          {/* service/app name */}
          <div className="row">
            <div className="field">
              <label className="label" htmlFor="name">
                Service/App Name
              </label>
              {externalState.errors.name && (
                <ErrorField errorMsgs={externalState.errors.name} />
              )}
              <input
                className="form"
                type="text"
                name="name"
                minLength={SERVICENAME_MIN_LENGTH}
                maxLength={SERVICENAME_MIN_LENGTH}
                pattern="[a-z ]+" // only lowercase letters
                defaultValue={externalState.registration?.name}
                placeholder="Service/App Name"
                required
              />
            </div>
          </div>

          {/* description */}
          <div className="row">
            <div className="field">
              <label className="label" htmlFor="description">
                Description
              </label>
              {externalState.errors.description && (
                <ErrorField errorMsgs={externalState.errors.description} />
              )}
              <textarea
                className="form"
                name="description"
                defaultValue={externalState.registration?.description}
                placeholder="Description"
              />
            </div>
          </div>

          {/* owner's name */}
          <div className="row">
            <div className="field">
              <label className="label" htmlFor="owner">
                Owner
              </label>
              {externalState.errors.owner && (
                <ErrorField errorMsgs={externalState.errors.owner} />
              )}
              <input
                type="text"
                name="owner"
                id="owner"
                defaultValue={externalState.registration?.owner}
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
              {externalState.errors.password && (
                <ErrorField errorMsgs={externalState.errors.password} />
              )}
              <input
                className={`form`}
                type={showPassword ? "text" : "password"}
                name="password"
                title={`Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters long.`}
                minLength={PASSWORD_MIN_LENGTH}
                maxLength={PASSWORD_MAX_LENGTH}
                defaultValue={externalState.registration?.password}
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
              {externalState.errors.confirm_password && (
                <ErrorField errorMsgs={externalState.errors.confirm_password} />
              )}
              <input
                className={`form`}
                type={showPassword ? "text" : "password"}
                name="confirm_password"
                title="Passwords must match"
                minLength={PASSWORD_MIN_LENGTH}
                maxLength={PASSWORD_MAX_LENGTH}
                defaultValue={externalState.registration?.confirm_password}
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
    </>
  );
}
