"use server";

import { cookies } from "next/headers";
import { handleAllowanceAddErrors, validateAddAllowanceCmd } from "..";
import { isGatewayError } from "@/app/api";
import { AddAllowanceActionCmd, AddAllowanceCmd } from "@/components/forms";
import { getAuthCookies } from "@/components/checkCookies";

const ErrMsgGeneric =
  "An error occurred: failed to add new allowance account. Please try again.";

export async function handleAddAllowance(
  previousState: AddAllowanceActionCmd,
  formData: FormData
) {
  // get form data
  const csrf = previousState.csrf;

  let add: AddAllowanceCmd = {
    csrf: csrf,

    username: formData.get("username") as string,
    slug: formData.get("slug") as string,
    birth_date: formData.get("birth_date") as string,
  };

  // get session cookie
  const cookies = await getAuthCookies("/allowances/add");
  if (!cookies.ok) {
    console.log(
      `failed to get auth cookies for user attempting to add an allowance account: ${
        cookies.error ? cookies.error.message : "unknown error"
      }`
    );
    return {
      csrf: csrf,
      complete: false,
      username: add.username,
      slug: add.slug,
      birth_date: add.birth_date,
      errors: {
        server: [
          `Failed to verify authentication cookies. Please login again and try to add the allowance account.`,
        ],
      },
    } as AddAllowanceActionCmd;
  }

  // light-weight validation of csrf token
  // true validation happpens in the gateway
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    console.log(
      `user ${cookies.data.identity?.username} submitted CSRF token which is missing or not well formed.`
    );
    return {
      csrf: csrf,
      complete: false,
      username: add.username,
      slug: add.slug,
      birth_date: add.birth_date,
      errors: {
        csrf: [
          "CSRF token is required and must be between 16 and 64 characters long.  It may not be tampered with.",
        ],
      },
    } as AddAllowanceActionCmd;
  }

  // light weight validation: actual values will be validated by gateway
  const errors = validateAddAllowanceCmd(add);
  if (Object.keys(errors).length > 0) {
    console.log(
      `user ${
        cookies.data.identity?.username
      } submitted allowance account data which did not pass validation: ${JSON.stringify(
        errors
      )}`
    );
    return {
      csrf: csrf,
      username: add.username,
      slug: add.slug,
      birth_date: add.birth_date,
      errors: errors,
    } as AddAllowanceActionCmd;
  }

  // call gateway to add allowance
  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/allowances/`,
      {
        method: "POST",
        headers: {
          Authorization: `${cookies.data.session}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(add),
      }
    );

    if (apiResponse.ok) {
      const success = await apiResponse.json();
      console.log(
        `user ${cookies.data.identity?.username} successfully added allowance account ${success.slug}`
      );
      return {
        csrf: previousState.csrf,
        complete: true,
        username: add.username,
        slug: add.slug,
        allowance_account: success.slug,
        errors: {},
      };
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        console.log(
          `user ${
            cookies.data.identity?.username
          } received an error from the gateway when adding allowance account: ${JSON.stringify(
            fail
          )}`
        );
        const errors = handleAllowanceAddErrors(fail);
        return {
          csrf: previousState.csrf,
          complete: false,

          errors: errors,
        };
      } else {
        console.log(
          `user ${
            cookies.data.identity?.username
          } received an unhandled gateway error from the gateway when adding allowance account: ${JSON.stringify(
            fail
          )}`
        );
        return {
          csrf: previousState.csrf,
          complete: false,
          username: add.username,
          slug: add.slug,
          birth_date: add.birth_date,
          errors: {
            server: [
              `Failed to add allowance account due to an gateway server error. Please try again.`,
            ],
          },
        } as AddAllowanceActionCmd;
      }
    }
  } catch (error) {
    console.log(
      `user ${cookies.data.identity?.username} encountered an error when attempting to add an allowance account: ${error}`
    );
    return {
      csrf: previousState.csrf,
      complete: false,
      username: add.username,
      slug: add.slug,
      birth_date: add.birth_date,
      errors: {
        server: [
          `Failed to add allowance account due to an internal server error. Please try again.`,
        ],
      },
    } as AddAllowanceActionCmd;
  }
}
