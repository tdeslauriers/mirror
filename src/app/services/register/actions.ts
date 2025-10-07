"use server";

import { cookies } from "next/headers";
import {
  handleServiceClientErrors,
  RegisterClient,
  validateClientRegister,
} from "..";
import { ClientRegisterActionCmd } from "./../../../components/forms/index";
import { isGatewayError } from "@/app/api";
import { getAuthCookies, getSessionCookie } from "@/components/checkCookies";

const ErrMsgGeneric =
  "An error occurred: failed to register service client. Please try again.";

export default async function handleClientRegister(
  previousState: ClientRegisterActionCmd,
  formData: FormData
) {
  // get the form data and csrf token
  let cmd: RegisterClient = {
    csrf: previousState.csrf, // field level check in validateClientRegister

    name: formData.get("name") as string,
    owner: formData.get("owner") as string,
    password: formData.get("password") as string,
    confirm_password: formData.get("confirm_password") as string,
  };

  // get auth cookies
  const cookies = await getAuthCookies("/services/register");
  if (!cookies.ok) {
    console.log(
      `Service client registration failed because could not verify session cookies: ${
        cookies.error ? cookies.error.message : "unknown error"
      }`
    );
    return {
      csrf: previousState.csrf,
      complete: false,
      registration: cmd,
      errors: {
        server: [
          cookies.error
            ? cookies.error.message
            : "unknown error related to session cookies.",
        ],
      },
    } as ClientRegisterActionCmd;
  }

  // validate the form data
  const errors = validateClientRegister(cmd);
  if (Object.keys(errors).length > 0) {
    console.log(
      `Service client registration validation failed for user ${
        cookies.data.identity?.username
      }: ${JSON.stringify(errors)}`
    );
    return {
      csrf: previousState.csrf,
      complete: false,
      registration: cmd,
      errors: errors,
    };
  }

  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/clients/register`,
      {
        method: "POST",
        headers: {
          Authorization: `${cookies.data.session}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cmd),
      }
    );

    if (apiResponse.ok) {
      const success = await apiResponse.json();
      console.log(
        `Service client ${success.slug} registered successfully by user ${cookies.data.identity?.username}.`
      );
      return {
        csrf: previousState.csrf,
        complete: true,
        registration: success, // will be created client object with uuid, slug, booleans, etc.
        errors: {},
      };
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleServiceClientErrors(fail);
        console.log(
          `Service client registration failed for user ${
            cookies.data.identity?.username
          }: ${JSON.stringify(errors)}`
        );
        return {
          csrf: previousState.csrf,
          complete: false,
          registration: cmd,
          errors: errors,
        };
      } else {
        console.error(
          `Service client registration failed for user ${
            cookies.data.identity?.username
          } due to unhandled gateway error: ${JSON.stringify(fail)}`
        );
        return {
          csrf: previousState.csrf,
          complete: false,
          registration: cmd,
          errors: {
            server: [
              fail
                ? JSON.stringify(fail)
                : "Service client registration failed due to an unhandled gateway error.",
            ],
          },
        };
      }
    }
  } catch (error) {
    console.error(
      `Service client registration failed for user ${
        cookies.data.identity?.username
      }: ${error ? error : "reason unknown"}`
    );
    return {
      csrf: previousState.csrf,
      complete: false,
      registration: cmd,
      errors: {
        server: [
          ErrMsgGeneric,
          "Service client registration failed due to an unknown error.",
        ],
      },
    };
  }
}
