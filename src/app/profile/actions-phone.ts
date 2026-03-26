"use server";

import { GatewayError } from "./../api/index";
import { getAuthCookies } from "@/components/checkCookies";
import {
  Phone,
  PhoneActionCmd,
  PhoneCmd,
  PhoneTypes,
  validatePhone,
} from "../users";
import { isGatewayError } from "../api";

export async function handlePhoneAdd(
  prevState: PhoneActionCmd,
  formData: FormData,
) {
  // get the form data
  const csrf = prevState.csrf;
  const username = prevState.username;

  const selected_phone_type = (formData.get("phone_type") as string).trim();
  const phone_type_key = [...PhoneTypes.entries()].find(
    ([, v]) => v === selected_phone_type,
  )?.[0];

  let phone: Phone = {
    country_code: (formData.get("country_code") as string).trim(),
    phone_number: (formData.get("phone_number") as string).trim(),
    extension: (formData.get("extension") as string).trim(),
    phone_type: phone_type_key,
    is_current: formData.get("is_current") === "on" ? true : false,
    is_primary: formData.get("is_primary") === "on" ? true : false,
  };

  // get the auth cookies
  // this is needed to retrieve the user's identity and session for the gateway request
  const cookies = await getAuthCookies("/profile");
  if (!cookies.ok) {
    return {
      csrf: csrf,
      username: username,
      phone: phone,
      errors: {
        server: [cookies.error.message || "Failed to get auth cookies."],
      },
    } as PhoneActionCmd;
  }

  // light weight validation of the csrf
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    console.log(
      `User ${cookies.data.identity?.username} submitted CSRF token which is missing or not well formed.`,
    );
    const errors: { [key: string]: string[] } = {};
    errors.csrf = [
      "CSRF token missing or not well formed. This value is required and cannot be tampered with.",
    ];
    return {
      csrf: csrf,
      username: username,
      phone: phone,
      errors: errors,
    } as PhoneActionCmd;
  }

  // light-weight validation of username
  // true validation happpens in the gateway
  if (!username || username.trim().length < 3 || username.trim().length > 30) {
    console.log(
      `User ${cookies.data.identity?.username} submitted username which is missing or not well formed.`,
    );
    const errors: { [key: string]: string[] } = {};
    errors.username = [
      "Username missing or not well formed. This value is required and cannot be tampered with.",
    ];
    return {
      csrf: csrf,
      username: username,
      phone: phone,
      errors: errors,
    } as PhoneActionCmd;
  }

  // validate the phone number fields
  const errors = validatePhone(phone);
  if (errors && Object.keys(errors).length > 0) {
    console.log(
      `Phone validation failed for user ${cookies.data.identity?.username} with errors: ${JSON.stringify(errors)}`,
    );
    return {
      csrf: csrf,
      username: username,
      phone: phone,
      errors: errors,
    } as PhoneActionCmd;
  }

  // build gateway request cmd
  const cmd: PhoneCmd = {
    csrf: csrf,
    username: username,
    phone: phone,
  };

  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/phones`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${cookies.data.session}`,
        },
        body: JSON.stringify(cmd),
      },
    );

    if (apiResponse.ok) {
      phone = await apiResponse.json();
      return {
        csrf: csrf,
        username: username,
        phone: phone,
        errors: {},
      } as PhoneActionCmd;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handlePhoneErrors(fail);
        console.log(
          `Phone add failed for user ${cookies.data.identity?.username} with gateway error: ${JSON.stringify(fail)}`,
        );
        return {
          csrf: csrf,
          username: username,
          phone: phone,
          errors: errors,
        } as PhoneActionCmd;
      } else {
        console.log(
          `Phone add failed for user ${cookies.data.identity?.username} with unknown gateway response: ${JSON.stringify(fail)}`,
        );
        return {
          csrf: csrf,
          username: username,
          phone: phone,
          errors: {
            server: ["An unknown error occurred."],
          },
        } as PhoneActionCmd;
      }
    }
  } catch (error) {
    if ((error as Error).message) {
      console.log(
        `Phone add failed for user ${cookies.data.identity?.username} with error: ${(error as Error).message}`,
      );
      return {
        csrf: csrf,
        username: username,
        phone: phone,
        errors: {
          server: [(error as Error).message],
        },
      } as PhoneActionCmd;
    } else {
      console.log(
        `Phone add failed for user ${cookies.data.identity?.username} with unknown error: ${JSON.stringify(error)}`,
      );
      return {
        csrf: csrf,
        username: username,
        phone: phone,
        errors: {
          server: ["An unknown error occurred."],
        },
      } as PhoneActionCmd;
    }
  }
}

export async function handlePhoneEdit(
  prevState: PhoneActionCmd,
  formData: FormData,
) {
  // get the form data
  const csrf = prevState.csrf;
  const slug = prevState.slug;
  const username = prevState.username;

  let phone: Phone = {
    // slug omitted because it is submitted as part of the command
    country_code: (formData.get("country_code") as string).trim(),
    phone_number: (formData.get("phone_number") as string).trim(),
    extension: (formData.get("extension") as string).trim(),
    phone_type: [...PhoneTypes.entries()].find(
      ([, v]) => v === (formData.get("phone_type") as string).trim(),
    )?.[0],
    is_current: formData.get("is_current") === "on" ? true : false,
    is_primary: formData.get("is_primary") === "on" ? true : false,
  };

  // get auth cookies
  // this is needed to retrieve the user's identity and session for the gateway request
  const cookies = await getAuthCookies("/profile");
  if (!cookies.ok) {
    console.log(`Failed to get auth cookies: ${cookies.error.message}`);
    return {
      csrf: csrf,
      slug: slug,
      username: username,
      phone: phone,
      errors: {
        server: [cookies.error.message || "Failed to get auth cookies."],
      },
    } as PhoneActionCmd;
  }

  // light-weight validation of csrf token
  // true validation happpens in the gateway
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    console.log(
      `User ${cookies.data.identity?.username} submitted CSRF token which is missing or not well formed.`,
    );
    const errors: { [key: string]: string[] } = {};
    errors.csrf = [
      "CSRF token missing or not well formed. This value is required and cannot be tampered with.",
    ];
    return {
      csrf: csrf,
      slug: slug,
      username: username,
      phone: phone,
      errors: errors,
    } as PhoneActionCmd;
  }

  // light-weight validation of slug
  // true validation happpens in the gateway
  if (!slug || slug.trim().length < 16 || slug.trim().length > 64) {
    console.log(
      `User ${cookies.data.identity?.username} submitted address slug which is missing or not well formed.`,
    );
    const errors: { [key: string]: string[] } = {};
    errors.slug = [
      "Address slug missing or not well formed. This value is required and cannot be tampered with.",
    ];
    return {
      csrf: csrf,
      slug: slug,
      username: username,
      phone: phone,
      errors: errors,
    } as PhoneActionCmd;
  }

  // light-weight validation of username
  // true validation happpens in the gateway
  if (!username || username.trim().length < 3 || username.trim().length > 30) {
    console.log(
      `User ${cookies.data.identity?.username} submitted username which is missing or not well formed.`,
    );
    const errors: { [key: string]: string[] } = {};
    errors.username = [
      "Username missing or not well formed. This value is required and cannot be tampered with.",
    ];
    return {
      csrf: csrf,
      slug: slug,
      username: username,
      phone: phone,
      errors: errors,
    } as PhoneActionCmd;
  }

  const errors = validatePhone(phone);
  if (errors && Object.keys(errors).length > 0) {
    console.log(
      `Phone validation failed for user ${cookies.data.identity?.username} with errors: ${JSON.stringify(errors)}`,
    );
    return {
      csrf: csrf,
      slug: slug,
      username: username,
      phone: phone,
      errors: errors,
    } as PhoneActionCmd;
  }

  // build gateway request cmd
  const cmd: PhoneCmd = {
    csrf: csrf,
    slug: slug,
    username: username,
    phone: phone,
  };

  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/phones`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${cookies.data.session}`,
        },
        body: JSON.stringify(cmd),
      },
    );

    if (apiResponse.ok) {
      phone = await apiResponse.json();
      return {
        csrf: csrf,
        slug: slug,
        username: username,
        phone: phone,
        errors: {},
      } as PhoneActionCmd;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handlePhoneErrors(fail);
        console.log(
          `Phone edit failed for user ${cookies.data.identity?.username} with gateway error: ${JSON.stringify(fail)}`,
        );
        return {
          csrf: csrf,
          slug: slug,
          username: username,
          phone: phone,
          errors: errors,
        } as PhoneActionCmd;
      } else {
        console.log(
          `Phone edit failed for user ${cookies.data.identity?.username} with unknown gateway response: ${JSON.stringify(fail)}`,
        );
        return {
          csrf: csrf,
          slug: slug,
          username: username,
          phone: phone,
          errors: {
            server: ["An unknown error occurred."],
          },
        } as PhoneActionCmd;
      }
    }
  } catch (error) {
    if ((error as Error).message) {
      console.log(
        `Phone edit failed for user ${cookies.data.identity?.username} with error: ${(error as Error).message}`,
      );
      return {
        csrf: csrf,
        slug: slug,
        username: username,
        phone: phone,
        errors: {
          server: [(error as Error).message],
        },
      } as PhoneActionCmd;
    } else {
      console.log(
        `Phone edit failed for user ${cookies.data.identity?.username} with unknown error: ${JSON.stringify(error)}`,
      );
      return {
        csrf: csrf,
        slug: slug,
        username: username,
        phone: phone,
        errors: {
          server: ["An unknown error occurred."],
        },
      } as PhoneActionCmd;
    }
  }
}

export async function handlePhoneRemove(
  slug: string,
  csrf: string,
  username: string,
) {
  // get auth cookies
  const cookies = await getAuthCookies("/profile");
  if (!cookies.ok) {
    console.log(`Failed to get auth cookies: ${cookies.error.message}`);
    return {
      ok: false,
      error: cookies.error.message || "Failed to get auth cookies.",
    };
  }

  // lightweight validation of csrf
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    return { ok: false, error: "CSRF token missing or not well formed." };
  }

  // lightweight validation of slug
  if (!slug || slug.trim().length < 16 || slug.trim().length > 64) {
    return { ok: false, error: "phone slug missing or not well formed." };
  }

  // lightweight validation of username
  if (!username || username.trim().length < 3 || username.trim().length > 30) {
    return { ok: false, error: "Username missing or not well formed." };
  }

  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/phones`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${cookies.data.session}`,
        },
        body: JSON.stringify({
          csrf: csrf,
          slug: slug,
          username: username,
        }),
      },
    );

    if (apiResponse.ok) {
      return { ok: true };
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        console.log(
          `Phone remove failed for user ${cookies.data.identity?.username} with gateway error: ${JSON.stringify(fail)}`,
        );
        return {
          ok: false,
          error: fail.message || "Failed to remove phone.",
        };
      } else {
        console.log(
          `Phone remove failed for user ${cookies.data.identity?.username} with unknown gateway response: ${JSON.stringify(fail)}`,
        );
        return {
          ok: false,
          error: "An unknown error occurred while removing phone.",
        };
      }
    }
  } catch (error) {
    if ((error as Error).message) {
      console.log(
        `Phone remove failed for user ${cookies.data.identity?.username} with error: ${(error as Error).message}`,
      );
      return {
        ok: false,
        error: (error as Error).message,
      };
    } else {
      console.log(
        `Phone remove failed for user ${cookies.data.identity?.username} with unknown error: ${JSON.stringify(error)}`,
      );
      return {
        ok: false,
        error: "An unknown error occurred while removing phone.",
      };
    }
  }
}

function handlePhoneErrors(gatewayError: GatewayError) {
  const errors: { [key: string]: string[] } = {};
  switch (gatewayError.code) {
    case 400:
      errors.server = [gatewayError.message];
      return errors;
    case 401:
      errors.server = [gatewayError.message];
      return errors;
    case 403:
      errors.server = [gatewayError.message];
      return errors;
    case 404:
      errors.server = [gatewayError.message];
      return errors;
    case 405:
      errors.server = [gatewayError.message];
      return errors;
    case 422:
      switch (true) {
        case gatewayError.message.includes("country code"):
          errors.country_code = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("phone number"):
          errors.phone_number = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("extension"):
          errors.extension = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("phone type"):
          errors.phone_type = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("is_primary"):
          errors.is_primary = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("is_current"):
          errors.is_current = [gatewayError.message];
          return errors;
        default:
          break;
      }
    default:
      errors.server = [gatewayError.message || "An unknown error occurred."];
      return errors;
  }
}
