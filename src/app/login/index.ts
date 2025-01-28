import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  checkUuid,
} from "../../validation/user_fields";
import { EMAIL_MIN_LENGTH } from "@/validation/user_fields";
import { OauthExchange } from "../api";

export const pageError =
  "Failed to load login page.  Please try again.  If the problem persists, please contact me.";

export const ErrLoginSumbit =
  "An error occurred processing your login. Please try again. If the problem persists, please contact me.";

export type LoginData = {
  username?: string;
  password?: string;
};

export type LoginCmd = {
  username?: string | null;
  password?: string | null;
  csrf?: string | null;
  session?: string | null;
  response_type?: string | null;
  state?: string | null;
  nonce?: string | null;
  client_id?: string | null;
  redirect?: string | null;
};

export type LoginActionCmd = {
  csrf: string | null;
  oauth: OauthExchange | null;
  login: LoginData | null;
  errors: { [key: string]: string[] };
};

// light-weight validation for login form data
export function validateLogin(login: LoginData) {
  const errors: { [key: string]: string[] } = {};

  // username
  if (!login.username || login.username.trim().length === 0) {
    errors.username = ["Email/username address is required."];
  }

  if (
    login.username &&
    (login.username.trim().length < EMAIL_MIN_LENGTH ||
      login.username.trim().length > EMAIL_MAX_LENGTH)
  ) {
    console.log(
      `Email/username must be between ${EMAIL_MIN_LENGTH} and ${EMAIL_MAX_LENGTH} characters.`
    );
    errors.username = [
      `Email/username must be between ${EMAIL_MIN_LENGTH} and ${EMAIL_MAX_LENGTH} characters.`,
    ];
  }

  // password
  if (!login.password || login.password.trim().length === 0) {
    errors.password = ["Password is required."];
  }

  if (
    login.password &&
    (login.password.trim().length < PASSWORD_MIN_LENGTH ||
      login.password.trim().length > PASSWORD_MAX_LENGTH)
  ) {
    console.log(
      `password between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`
    );
    errors.password = [
      `password between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`,
    ];
  }

  return errors;
}

// logs and throws error if oauth data element is not valid
export function validateOauth(oauth: OauthExchange) {
  if (
    !oauth.client_id ||
    oauth.client_id.trim().length <= 0 ||
    oauth.client_id.trim().length > 36 ||
    !checkUuid(oauth.client_id.trim()).isValid
  ) {
    console.log(
      "client_id url query param either missing or not well formed uuid"
    );
    throw new Error(ErrLoginSumbit);
  }

  if (
    !oauth.response_type ||
    oauth.response_type.trim().length < 3 ||
    oauth.response_type.trim().length > 10
  ) {
    console.log(
      "response type url query param missing,too short, or too long."
    );
    throw new Error(ErrLoginSumbit);
  }

  if (
    !oauth.state ||
    oauth.state.trim().length <= 0 ||
    oauth.state.trim().length > 256
  ) {
    console.log("state url query param either missing or not well formed");
    throw new Error(ErrLoginSumbit);
  }

  if (
    !oauth.nonce ||
    oauth.nonce.trim().length <= 0 ||
    oauth.nonce.trim().length > 36 ||
    !checkUuid(oauth.nonce).isValid
  ) {
    console.log("nonce url query param either missing or not well formed uuid");
    throw new Error(ErrLoginSumbit);
  }

  if (
    !oauth.redirect_url ||
    oauth.redirect_url.trim().length < 11 ||
    oauth.redirect_url.trim().length > 2048
  ) {
    console.log(
      "redirect url query param missing, too short or too long for a valid url."
    );
    throw new Error(ErrLoginSumbit);
  }
}
