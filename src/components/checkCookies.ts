"use server";

import { cookies } from "next/headers";
import GetOauthExchange from "./oauth-exchange";
import { redirect } from "next/navigation";
import {
  checkBirthdate,
  checkEmail,
  checkName,
  checkUuid,
} from "@/validation/user_fields";
import { IdentityCookie } from "@/app/api";

export type UiCookies = {
  identity: IdentityCookie | null;
  session: string | null;
};

// defining schemas for type checking the cookies
const userAccessFlagsSchema = {
  user_read: "boolean",
  user_write: "boolean",
  scope_read: "boolean",
  scope_write: "boolean",
  client_read: "boolean",
  client_write: "boolean",
};

const galleryAccessFlagsSchema = {
  album_read: "boolean",
  album_write: "boolean",
  image_read: "boolean",
  image_write: "boolean",
};

const blogAccessFlagsSchema = {
  blog_read: "boolean",
  blog_write: "boolean",
};

const taskAccessFlagsSchema = {
  account_read: "boolean",
  account_write: "boolean",
  allowances_read: "boolean",
  allowances_write: "boolean",
  tasks_read: "boolean",
  tasks_write: "boolean",
  templates_read: "boolean",
  templates_write: "boolean",
};

const uxRenderSchema = {
  profile_read: "boolean",
  users: userAccessFlagsSchema,
  gallery: galleryAccessFlagsSchema,
  blog: blogAccessFlagsSchema,
  tasks: taskAccessFlagsSchema,
};

const identityCookieSchema = {
  username: "stringOrNull",
  fullname: "stringOrNull",
  given_name: "stringOrNull",
  family_name: "stringOrNull",
  birthdate: "string", // optional
  ux_render: uxRenderSchema,
};

// checks for identity cookie and if does not exist, redirects to login,
// and sets the state var to the current page.
export async function getAuthCookies(page: string) {
  const cookieStore = await cookies();

  // identity cookie
  const hasIdentity = cookieStore.has("identity")
    ? cookieStore.get("identity")
    : null;

  // session cookie
  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;

  // check session cookie exists
  if (!hasSession) {
    console.log(`Failed to load ${page} page: session cookie is missing`);
    throw new Error(`Failed to load ${page} page: session cookie is missing`);
  }

  // check session cookie is well formed
  const checkSession = checkUuid(hasSession?.value);
  if (!checkSession.isValid) {
    throw new Error(`Failed to load ${page} page: session cookie is invalid`);
  }

  // if identity cookie is missing, redirect to login page
  if (!hasIdentity) {
    const oauth = await GetOauthExchange(hasSession?.value, page);
    if (oauth) {
      redirect(
        `/login?client_id=${oauth.client_id}&response_type=${oauth.response_type}&state=${oauth.state}&nonce=${oauth.nonce}&redirect_url=${oauth.redirect_url}`
      );
    } else {
      redirect("/login");
    }
  }

  // parse identity cookie and validate it is in expected object schema
  let identity: IdentityCookie | null = null;
  if (hasIdentity) {
    const identityRaw = hasIdentity.value;
    const identityParsed = JSON.parse(identityRaw);

    if (validateStrict(identityParsed, identityCookieSchema)) {
      identity = identityParsed;
    } else {
      console.log("Identity cookie is invalid.");
      throw new Error(
        "Identity cookie is invalid.  This value is required and cannot be tampered with."
      );
    }
  }

  // check that identity cookie values are well formed
  if (!identity) {
    console.log("Identity cookie is missing.");
    throw new Error(
      "Identity cookie is missing.  This value is required and cannot be tampered with."
    );
  }

  if (!identity.username) {
    console.log("Identity cookie username is missing.");
    throw new Error(
      "Identity cookie username is missing.  This value is required and cannot be tampered with."
    );
  } else {
    const check = checkEmail(identity.username);
    if (!check.isValid) {
      const err =
        "Identity cookie username is invalid: " + check.messages.join("; ");
      console.log(err);
      throw new Error(err);
    }
  }

  // check fullname is well formed
  if (!identity.fullname) {
    console.log("Identity cookie fullname is missing.");
    throw new Error(
      "Identity cookie fullname is missing.  This value is required and cannot be tampered with."
    );
  } else {
    const check = checkName(identity.fullname);
    if (!check.isValid) {
      const err =
        "Identity cookie fullname is invalid." + check.messages.join("; ");
      console.log(err);
      throw new Error(err);
    }
  }

  // check given_name is well formed
  if (!identity.given_name) {
    console.log("Identity cookie given_name is missing.");
    throw new Error(
      "Identity cookie given_name is missing.  This value is required and cannot be tampered with."
    );
  } else {
    const check = checkName(identity.given_name);
    if (!check.isValid) {
      const err =
        "Identity cookie given_name is invalid." + check.messages.join("; ");
      console.log(err);
      throw new Error(err);
    }
  }

  // check family_name is well formed
  if (!identity.family_name) {
    console.log("Identity cookie family_name is missing.");
    throw new Error(
      "Identity cookie family_name is missing.  This value is required and cannot be tampered with."
    );
  } else {
    const check = checkName(identity.family_name);
    if (!check.isValid) {
      const err =
        "Identity cookie family_name is invalid: " + check.messages.join("; ");
      console.log(err);
      throw new Error(err);
    }
  }

  // check birthdate is well formed if present
  if (identity.birthdate) {
    const dob = new Date(identity.birthdate);

    const check = checkBirthdate(
      dob.getFullYear(),
      dob.getMonth(),
      dob.getDate()
    );
    if (!check.isValid) {
      const err =
        "Identity cookie birthdate is invalid: " + check.messages.join("; ");
      console.log(err);
      throw new Error(err);
    }
  }

  return { identity: identity, session: hasSession?.value } as UiCookies;
}

export async function checkForSessionCookie() {
  const cookieStore = await cookies();

  const hasSession = cookieStore.has("session_id")
    ? cookieStore.get("session_id")
    : null;

  if (!hasSession) {
    throw new Error(
      "Session cookie is missing.  This value is required and cannot be tampered with."
    );
  }

  const checkSession = checkUuid(hasSession?.value);
  if (!checkSession.isValid) {
    throw new Error(
      "Session cookie is invalid.  This value is required and cannot be tampered with."
    );
  }

  return hasSession;
}

// perform type checks on values of schemas
function isValidValue(val: any, type: string): boolean {
  if (type === "boolean") return typeof val === "boolean";
  if (type === "string") return typeof val === "string";
  if (type === "stringOrNull") return typeof val === "string" || val === null;
  return false;
}

// validate the field types are correct and doesnt include unexpected key/values
function validateStrict(obj: any, schema: any): boolean {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj))
    return false;

  const expectedKeys = Object.keys(schema);
  const actualKeys = Object.keys(obj);

  // extra keys are not allowed
  for (const key of actualKeys) {
    if (!expectedKeys.includes(key)) {
      return false;
    }
  }

  for (const [key, typeOrNested] of Object.entries(schema)) {
    // optional keys are allowed
    if (!(key in obj)) continue;

    const value = obj[key];

    // check if the constant is a primative or an object
    // if primative, type check, if object, recurse
    if (typeof typeOrNested === "string") {
      if (!isValidValue(value, typeOrNested)) {
        return false;
      }
    } else if (typeof typeOrNested === "object") {
      // check for nested objects
      if (!validateStrict(value, typeOrNested)) {
        return false;
      }
    } else {
      return false;
    }
  }

  return true;
}
