// api json objects
export type OauthExchange  = {
  response_type?: string | null;
  nonce?: string | null;
  state?: string | null;
  client_id?: string | null;
  redirect_url?: string | null;
  created_at?: string | null;
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
};

// type checked before usage
export type GatewayError = {
  code: number;
  status: string;
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
