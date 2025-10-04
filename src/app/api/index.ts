import { useRouter } from "next/navigation";
// api json objects
export type OauthExchange = {
  response_type?: string | null;
  nonce?: string | null;
  state?: string | null;
  client_id?: string | null;
  redirect_url?: string | null;
  created_at?: string | null;
};

export type State = {
  state_csrf?: string | null;
  nav_endpoint?: string | null;
};

export type Registration = {
  username: string | null;
  password: string | null;
  confirm_password: string | null;
  firstname: string | null;
  lastname: string | null;
  birthMonth?: string;
  birthDay?: string;
  birthYear?: string;
  csrf?: string;
  session?: string;
};

export type Credentials = {
  username: string | null;
  password: string | null;
  csrf?: string;
};

export type CallbackCmd = {
  session?: string; // session is not returned by the gateway, it is added later by callback route
  auth_code: string | null;
  response_type: string | null;
  state: string | null;
  nonce: string | null;
  client_id: string | null;
  redirect: string | null;
};

export type CallbackResponse = {
  session: string;

  authenticated: string;
  username: string;
  fullname: string;
  given_name: string;
  family_name: string;
  birthdate?: string;
  ux_render?: UxRender;
};

export type CallbackUrl = {
  redirect: string | null;
};

export type IdentityCookie = {
  username: string | null;
  fullname: string | null;
  given_name: string | null;
  family_name: string | null;
  birthdate?: string;
  ux_render?: UxRender;
};

// UxRender is an object that reflects the visual elements that are available to the user
// on the client side.  This struct is used to determine what the user can see and interact with.
// NOTE: these flags are ux/ui convenience for feature display ONLY:
// they in no way give the user access to the data that is being called by the respective apis.
export type UxRender = {
  profile_read?: boolean;

  // site modules and their associated access
  users?: UserAccessFlags;
  gallery?: GalleryAccessFlags;
  blog?: BlogAccessFlags;
  tasks?: TaskAccessFlags;
};

export type UserAccessFlags = {
  user_read?: boolean;
  user_write?: boolean;
  scope_read?: boolean;
  scope_write?: boolean;
  client_read?: boolean;
  client_write?: boolean;
};

export type GalleryAccessFlags = {
  album_read?: boolean;
  album_write?: boolean;
  image_read?: boolean;
  image_write?: boolean;
};

export type BlogAccessFlags = {
  blog_read?: boolean;
  blog_write?: boolean;
};

export type TaskAccessFlags = {
  account_read?: boolean;
  account_write?: boolean;
  allowances_read?: boolean;
  allowances_write?: boolean;
  tasks_read?: boolean;
  tasks_write?: boolean;
  templates_read?: boolean;
  templates_write?: boolean;
};

// type checked before usage
export type GatewayError = {
  code: number;
  message: string;
};

export function isGatewayError(object: any): object is GatewayError {
  return (
    object &&
    typeof object.code === "number" &&
    typeof object.message === "string"
  );
}

// validate session_id: super light-weight, just check for absurd tampering
export function isValidSessionId(sessionId: string) {
  if (!sessionId.length || sessionId.length < 16 || sessionId.length > 64) {
    return false;
  }
  return true;
}

export const ErrMsgGeneric =
  "An error occurred. Please try again. If the problem persists, please contact me.";
