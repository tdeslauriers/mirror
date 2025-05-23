"use client";

import {
  checkPassword,
  FieldValidation,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/validation/user_fields";
import { ChangeEvent, useActionState, useState } from "react";
import ErrorField from "@/components/errors/error-field";
import FormSubmit from "@/components/forms/form-submit";
import { ResetData, ResetPwActionCmd } from ".";

type Err = { [key: string]: string[] };

export default function ResetForm({
  csrf,
  resource_id,
  handleReset,
}: {
  csrf: string | null;
  resource_id?: string;
  handleReset: (
    prevState: ResetPwActionCmd,
    formData: FormData
  ) => ResetPwActionCmd | Promise<ResetPwActionCmd>;
}) {
  const [passwords, setPasswords] = useState<ResetData>({});
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
    let errors = validatePwClientForm(passwords);
    setFieldErrors(errors);
  };

  const [resetState, formAction] = useActionState(handleReset, {
    csrf: csrf,
    resource_id: resource_id,
    reset: {},
    errors: {},
  });

  return (
    <>
      <form className={`form`} action={formAction}>
        {resetState.errors.server && (
          <ErrorField errorMsgs={resetState.errors.server} />
        )}
        <div className={`row`}>
          <div className={`field`}>
            <label className={`label`} htmlFor="current_password">
              Current Password
            </label>
            {fieldErrors.current_password && (
              <ErrorField errorMsgs={fieldErrors.current_password} />
            )}
            {resetState.errors.current_password && (
              <ErrorField errorMsgs={resetState.errors.current_password} />
            )}
            <input
              className={`form`}
              type={showPassword ? "text" : "password"}
              name="current_password"
              title={`Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters long.`}
              minLength={PASSWORD_MIN_LENGTH}
              maxLength={PASSWORD_MAX_LENGTH}
              defaultValue={resetState.reset?.current_password}
              placeholder="Current Password"
              onChange={handlePwChange}
              onBlur={handleOnBlur}
              required
            />
          </div>
        </div>
        <div className={`row`}>
          <div className={`field`}>
            <label className={`label`} htmlFor="new_password">
              New Password
            </label>
            {fieldErrors.new_password && (
              <ErrorField errorMsgs={fieldErrors.new_password} />
            )}
            {resetState.errors.new_password && (
              <ErrorField errorMsgs={resetState.errors.new_password} />
            )}
            <input
              className={`form`}
              type={showPassword ? "text" : "password"}
              name="new_password"
              title={`Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters long.`}
              minLength={PASSWORD_MIN_LENGTH}
              maxLength={PASSWORD_MAX_LENGTH}
              defaultValue={resetState.reset?.new_password}
              placeholder="New Password"
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
            {resetState.errors.confirm_password && (
              <ErrorField errorMsgs={resetState.errors.confirm_password} />
            )}
            <input
              className={`form`}
              type={showPassword ? "text" : "password"}
              name="confirm_password"
              title="Passwords must match"
              minLength={PASSWORD_MIN_LENGTH}
              maxLength={PASSWORD_MAX_LENGTH}
              defaultValue={resetState.reset?.confirm_password}
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

        <div className={`row`}>
          <FormSubmit
            buttonLabel="update password"
            pendingLabel="updating password..."
          />
        </div>
      </form>
    </>
  );
}

// this one must be different from the actions one because it should only fire if all fields are filled in
function validatePwClientForm(reset: ResetData) {
  const errors: { [key: string]: string[] } = {};

  // check length of current password
  if (
    reset.current_password &&
    (reset.current_password.trim().length < PASSWORD_MIN_LENGTH ||
      reset.current_password.trim().length > PASSWORD_MAX_LENGTH)
  ) {
    errors.current_password = [
      `Current password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`,
    ];
  }

  if (
    reset.new_password &&
    (reset.new_password.trim().length < PASSWORD_MIN_LENGTH ||
      reset.new_password.trim().length > PASSWORD_MAX_LENGTH)
  ) {
    errors.new_password = [
      `New password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`,
    ];
  }

  if (reset.new_password) {
    const passwordCheck: FieldValidation = checkPassword(reset.new_password);
    if (!passwordCheck.isValid) {
      errors.new_password = passwordCheck.messages;
    }
  }

  if (
    reset.confirm_password?.trim() &&
    reset.new_password?.trim() !== reset.confirm_password?.trim()
  ) {
    console.log("New password and confirmation password do not match.");
    errors.confirm_password = [
      "New password and confirmation password do not match.",
    ];
  }

  return errors;
}
