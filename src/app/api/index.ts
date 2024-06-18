export type Registration = {
  username: string;
  password: string;
  confirm_password: string;
  firstname: string;
  lastname: string;
  birthMonth?: string;
  birthDay?: string;
  birthYear?: string;
};

export type Credentials = {
  username: string;
  password: string;
};

export type LoginCmd = {
  username: string;
  password: string;
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
