export type OauthExchange = {
  response_type: string | null;
  nonce: string | null;
  state: string | null;
  client_id: string | null;
  redirect_url: string | null;
  created_at: string | null;
};

export type Registration = {
  username: string;
  password: string;
  confirm_password: string;
  firstname: string;
  lastname: string;
  birthMonth?: string;
  birthDay?: string;
  birthYear?: string;
  csrf?: string;
  session?: string;
};

export type Credentials = {
  username: string;
  password: string;
  csrf?: string;
};

export type LoginCmd = {
  username: string;
  password: string;
  csrf?: string;
  session?: string;
  response_type: string | null;
  state: string | null;
  nonce: string | null;
  client_id: string | null;
  redirect: string | null;
};

export type CallbackCmd = {
  auth_code: string | null;
  response_type: string | null;
  state: string | null;
  nonce: string | null;
  client_id: string | null;
  redirect: string | null;
};

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
