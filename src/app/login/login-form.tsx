"use client";

import { useActionState, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  EMAIL_MAX_LENGTH,
  EMAIL_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/validation/user_fields";
import { handleLogin } from "./actions";
import { OauthExchange } from "../api";
import FormSubmit from "@/components/form-submit";
import ErrorField from "@/components/errors/error-field";

export default function LoginForm({
  csrf,
  oauth,
}: {
  csrf: string;
  oauth: OauthExchange;
}) {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const path = usePathname();

  useEffect(() => {
    const responseTypeParam = searchParams.get("response_type");
    const stateParam = searchParams.get("state");
    const nonceParam = searchParams.get("nonce");
    const clientIdParam = searchParams.get("client_id");
    const redirectUrlParam = searchParams.get("redirect_url");

    if (
      !responseTypeParam ||
      !stateParam ||
      !nonceParam ||
      !clientIdParam ||
      !redirectUrlParam
    ) {
      // update url with state and nonce
      router.replace(
        `${path}?client_id=${oauth.client_id}&response_type=${
          oauth.response_type
        }&state=${oauth.state}&nonce=${
          oauth.nonce
        }&redirect_url=${encodeURIComponent(oauth.redirect_url ?? "")}`
      );
    }
  }); // omitting empty dependency array so it only runs once when component mounts.

  const [loginState, formAction, pending] = useActionState(handleLogin, {
    csrf: csrf,
    oauth: oauth,
    login: {},
    errors: {},
  });

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <form className={`form`} action={formAction}>
        {loginState.errors.server && (
          <ErrorField errorMsgs={loginState.errors.server} />
        )}
        {loginState.errors.badrequest && (
          <ErrorField errorMsgs={loginState.errors.badrequest} />
        )}
        {loginState.errors.oauth && (
          <ErrorField errorMsgs={loginState.errors.oauth} />
        )}
        {loginState.errors.credentials && (
          <ErrorField errorMsgs={loginState.errors.credentials} />
        )}
        {loginState.errors.response_type && (
          <ErrorField errorMsgs={loginState.errors.response_type} />
        )}
        {loginState.errors.state && (
          <ErrorField errorMsgs={loginState.errors.state} />
        )}
        {loginState.errors.nonse && (
          <ErrorField errorMsgs={loginState.errors.nonse} />
        )}
        {loginState.errors.redirect && (
          <ErrorField errorMsgs={loginState.errors.redirect} />
        )}
        {loginState.errors.client_id && (
          <ErrorField errorMsgs={loginState.errors.client_id} />
        )}
        {loginState.errors.callback && (
          <ErrorField errorMsgs={loginState.errors.callback} />
        )}

        <div className={"row"}>
          <div className={`field`}>
            <label className={`label`} htmlFor="username">
              email
            </label>
            {loginState.errors.username && (
              <ErrorField errorMsgs={loginState.errors.username} />
            )}
            <input
              className={`form`}
              type="text"
              name="username"
              title={`Email must be between ${EMAIL_MIN_LENGTH} and ${EMAIL_MAX_LENGTH} characters long.`}
              minLength={EMAIL_MIN_LENGTH}
              maxLength={EMAIL_MAX_LENGTH}
              defaultValue={loginState.login?.username}
              placeholder="Email"
              required
            />
          </div>
        </div>
        <div className={`row`}>
          <div className={`field`}>
            <label className={`label`} htmlFor="password">
              Password
            </label>
            {loginState.errors.password && (
              <ErrorField errorMsgs={loginState.errors.password} />
            )}
            <input
              className={`form`}
              type={showPassword ? "text" : "password"}
              name="password"
              title={`Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters long.`}
              minLength={PASSWORD_MIN_LENGTH}
              maxLength={PASSWORD_MAX_LENGTH}
              defaultValue={loginState.login?.password}
              placeholder="Password"
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
          <FormSubmit buttonLabel="login" pendingLabel="logging in..." />
        </div>
      </form>
    </>
  );
}
