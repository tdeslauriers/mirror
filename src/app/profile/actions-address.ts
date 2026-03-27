"use server";

import { getAuthCookies } from "@/components/checkCookies";
import {
  Address,
  AddressActionCmd,
  AddressCmd,
  validateAddress,
} from "../users";
import { ErrMsgGeneric, GatewayError, isGatewayError } from "../api";

export async function handleAddressAdd(
  previousState: AddressActionCmd,
  formData: FormData,
) {
  // get the form data
  const csrf = previousState.csrf;
  const username = previousState.username;

  let address: Address = {
    street_address: formData.get("street_address") as string,
    street_address_2: formData.get("street_address_2") as string,
    city: formData.get("city") as string,
    state_province: formData.get("state") as string,
    postal_code: formData.get("postal_code") as string,
    country: formData.get("country") as string,
    is_current: formData.get("is_current") === "on" ? true : false,
    is_primary: formData.get("is_primary") === "on" ? true : false,
  };

  // get the auth cookies
  // this is needed to get the user's identity and session for the gateway request
  const cookies = await getAuthCookies("/profile");
  if (!cookies.ok) {
    console.log(`Failed to get auth cookies: ${cookies.error.message}`);
    return {
      csrf: csrf,
      username: username,
      address: address,
      errors: {
        server: [cookies.error.message || "Failed to get auth cookies."],
      },
    } as AddressActionCmd;
  }

  // light-weight validation of csrf token
  // true validation happpens in the gateway
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    console.log(
      `User ${cookies.data.identity?.username} submitted CSRF token which is missing or not well formed.`,
    );
    const errors: { [key: string]: string[] } = {};
    errors.server = [
      "CSRF token missing or not well formed. This value is required and cannot be tampered with.",
    ];
    return {
      csrf: csrf,
      username: username,
      address: address,
      errors: errors,
    } as AddressActionCmd;
  }

  // light-weight validation of username
  // true validation happpens in the gateway
  if (!username || username.trim().length < 3 || username.trim().length > 30) {
    console.log(
      `User ${cookies.data.identity?.username} submitted username which is missing or not well formed.`,
    );
    const errors: { [key: string]: string[] } = {};
    errors.server = [
      "Username missing or not well formed. This value is required and cannot be tampered with.",
    ];
    return {
      csrf: csrf,
      username: username,
      address: address,
      errors: errors,
    } as AddressActionCmd;
  }

  // validate address fields
  const errors = validateAddress(address);
  if (errors && Object.keys(errors).length > 0) {
    console.log(
      `Address validation failed for user ${
        cookies.data.identity?.username
      }: ${JSON.stringify(errors)}`,
    );
    return {
      csrf: csrf,
      username: username,
      address: address,
      errors: errors,
    } as AddressActionCmd;
  }

  // build gateway request cmd
  const cmd: AddressCmd = {
    csrf: csrf,
    username: username,
    address: address,
  };

  // call gateway address endpoint
  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/addresses`,
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
      address = await apiResponse.json();
      console.log(
        `Address added successfully for user ${cookies.data.identity?.username}`,
      );
      return {
        csrf: csrf,
        username: username,
        address: address,
        errors: {},
      } as AddressActionCmd;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleAddressErrors(fail);
        console.log(
          `Address add failed for user ${
            cookies.data.identity?.username
          }: ${JSON.stringify(errors)}`,
        );
        return {
          csrf: csrf,
          username: username,
          address: address,
          errors: errors,
        } as AddressActionCmd;
      } else {
        console.error(
          `Address add failed for user ${cookies.data.identity?.username} due to unhandled gateway error: ${apiResponse.status} ${apiResponse.statusText}`,
        );
        return {
          csrf: csrf,
          username: username,
          address: address,
          errors: {
            server: ["Address add failed due to an unhandled gateway error."],
          },
        } as AddressActionCmd;
      }
    }
  } catch (error) {
    if ((error as Error).message) {
      console.error(
        `Address add failed for user ${
          cookies.data.identity?.username
        }: ${(error as Error).message}`,
      );
      return {
        csrf: csrf,
        username: username,
        address: address,
        errors: {
          server: [
            (error as Error).message ||
              "Address add failed due to an unexpected error.",
          ],
        },
      } as AddressActionCmd;
    } else {
      console.error(
        `Address add failed for user ${
          cookies.data.identity?.username
        } due to an unexpected error.`,
      );
      return {
        csrf: csrf,
        username: username,
        address: address,
        errors: {
          server: ["Address add failed due to an unexpected error."],
        },
      } as AddressActionCmd;
    }
  }
}

export async function handleAddressEdit(
  previousState: AddressActionCmd,
  formData: FormData,
) {
  // get the form data
  const csrf = previousState.csrf;
  const slug = previousState.slug;
  const username = previousState.username;

  let address: Address = {
    street_address: formData.get("street_address") as string,
    street_address_2: formData.get("street_address_2") as string,
    city: formData.get("city") as string,
    state_province: formData.get("state") as string,
    postal_code: formData.get("postal_code") as string,
    country: formData.get("country") as string,
    is_current: formData.get("is_current") === "on" ? true : false,
    is_primary: formData.get("is_primary") === "on" ? true : false,
  };

  // get the auth cookies
  // this is needed to get the user's identity and session for the gateway request
  const cookies = await getAuthCookies("/profile");
  if (!cookies.ok) {
    console.log(`Failed to get auth cookies: ${cookies.error.message}`);
    return {
      csrf: csrf,
      slug: slug,
      username: username,
      address: address,
      errors: {
        server: [cookies.error.message || "Failed to get auth cookies."],
      },
    } as AddressActionCmd;
  }

  // light-weight validation of csrf token
  // true validation happpens in the gateway
  if (!csrf || csrf.trim().length < 16 || csrf.trim().length > 64) {
    console.log(
      `User ${cookies.data.identity?.username} submitted CSRF token which is missing or not well formed.`,
    );
    const errors: { [key: string]: string[] } = {};
    errors.server = [
      "CSRF token missing or not well formed. This value is required and cannot be tampered with.",
    ];
    return {
      csrf: csrf,
      slug: slug,
      username: username,
      address: address,
      errors: errors,
    } as AddressActionCmd;
  }

  // light-weight validation of slug
  // true validation happpens in the gateway
  if (!slug || slug.trim().length < 16 || slug.trim().length > 64) {
    console.log(
      `User ${cookies.data.identity?.username} submitted address slug which is missing or not well formed.`,
    );
    const errors: { [key: string]: string[] } = {};
    errors.server = [
      "Address slug missing or not well formed. This value is required and cannot be tampered with.",
    ];
    return {
      csrf: csrf,
      slug: slug,
      username: username,
      address: address,
      errors: errors,
    } as AddressActionCmd;
  }

  // light-weight validation of username
  // true validation happpens in the gateway
  if (!username || username.trim().length < 3 || username.trim().length > 30) {
    console.log(
      `User ${cookies.data.identity?.username} submitted username which is missing or not well formed.`,
    );
    const errors: { [key: string]: string[] } = {};
    errors.server = [
      "Username missing or not well formed. This value is required and cannot be tampered with.",
    ];
    return {
      csrf: csrf,
      slug: slug,
      username: username,
      address: address,
      errors: errors,
    } as AddressActionCmd;
  }

  // validate address fields
  const errors = validateAddress(address);
  if (errors && Object.keys(errors).length > 0) {
    console.log(
      `Address validation failed for user ${
        cookies.data.identity?.username
      }: ${JSON.stringify(errors)}`,
    );
    return {
      csrf: csrf,
      username: username,
      address: address,
      errors: errors,
    } as AddressActionCmd;
  }

  // set up gateway request cmd
  const cmd: AddressCmd = {
    csrf: csrf,
    slug: slug,
    username: username,
    address: address,
  };

  // call gateway address endpoint
  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/addresses`,
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
      address = await apiResponse.json();
      console.log(
        `Address edited successfully for user ${cookies.data.identity?.username}`,
      );
      return {
        csrf: csrf,
        slug: slug,
        username: username,
        address: address,
        errors: {},
      } as AddressActionCmd;
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleAddressErrors(fail);
        console.log(
          `Address edit failed for user ${
            cookies.data.identity?.username
          }: ${JSON.stringify(errors)}`,
        );
        return {
          csrf: csrf,
          slug: slug,
          username: username,
          address: address,
          errors: errors,
        } as AddressActionCmd;
      } else {
        console.error(
          `Address edit failed for user ${cookies.data.identity?.username} due to unhandled gateway error: ${apiResponse.status} ${apiResponse.statusText}`,
        );
        return {
          csrf: csrf,
          slug: slug,
          username: username,
          address: address,
          errors: {
            server: ["Address edit failed due to an unhandled gateway error."],
          },
        } as AddressActionCmd;
      }
    }
  } catch (error) {
    if ((error as Error).message) {
      console.error(
        `Address edit failed for user ${
          cookies.data.identity?.username
        }: ${(error as Error).message}`,
      );
      return {
        csrf: csrf,
        slug: slug,
        username: username,
        address: address,
        errors: {
          server: [
            (error as Error).message ||
              "Address edit failed due to an unexpected error.",
          ],
        },
      } as AddressActionCmd;
    } else {
      console.error(
        `Address edit failed for user ${
          cookies.data.identity?.username
        } due to an unexpected error.`,
      );
      return {
        csrf: csrf,
        slug: slug,
        username: username,
        address: address,
        errors: {
          server: ["Address edit failed due to an unexpected error."],
        },
      } as AddressActionCmd;
    }
  }
}

export async function handleAddressRemove(
  slug: string,
  csrf: string,
  username: string,
): Promise<{ ok: boolean; error?: string }> {
  // get cookies
  const cookies = await getAuthCookies("/profile");
  if (!cookies.ok) {
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
    return { ok: false, error: "Address slug missing or not well formed." };
  }

  // lightweight validation of username
  if (!username || username.trim().length < 3 || username.trim().length > 30) {
    return { ok: false, error: "Username missing or not well formed." };
  }

  try {
    const apiResponse = await fetch(
      `${process.env.GATEWAY_SERVICE_URL}/addresses`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${cookies.data.session}`,
        },
        body: JSON.stringify({ csrf, slug, username }),
      },
    );

    if (apiResponse.ok) {
      console.log(
        `Address ${slug} removed successfully for user ${cookies.data.identity?.username}`,
      );
      return { ok: true };
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        return { ok: false, error: fail.message };
      }
      console.error(
        `Address remove failed for user ${cookies.data.identity?.username} due to unhandled gateway error: ${apiResponse.status} ${apiResponse.statusText}`,
      );
      return {
        ok: false,
        error: "Address remove failed due to an unhandled gateway error.",
      };
    }
  } catch (error) {
    console.error(
      `Address remove failed for user ${cookies.data.identity?.username}: ${(error as Error).message}`,
    );
    return {
      ok: false,
      error:
        (error as Error).message ||
        "Address remove failed due to an unexpected error.",
    };
  }
}

function handleAddressErrors(gatewayError: GatewayError) {
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
      // temporary fix for now: determine which error received
      switch (true) {
        case gatewayError.message.includes("address line 1"):
          errors.street_address = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("address line 2"):
          errors.street_address_2 = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("city"):
          errors.city = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("state"):
          errors.state = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("postal code"):
          errors.postal_code = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("country"):
          errors.country = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("current"):
          errors.is_current = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("primary"):
          errors.is_primary = [gatewayError.message];
          return errors;
        default:
          break;
      }
    default:
      errors.server = [gatewayError.message || ErrMsgGeneric];
      return errors;
  }
}
