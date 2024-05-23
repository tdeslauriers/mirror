import { Credentials } from "@/validation/profile";

export async function POST(req: Request) {
  const credentials: Credentials = await req.json();

  // field validation
  const errors = validateLogin(credentials);
  if (errors && Object.keys(errors).length > 0) {
    return new Response(JSON.stringify(errors), {
      status: 422,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

function validateLogin(creds: Credentials) {
  const errors: { [key: string]: string[] } = {};

  // check username for field level errors
  if (creds.username.trim().length > 254) {
    errors.username = ["Email/username must be less than 254 characters."];
  }

  // check password for field level errors
  if (creds.password.trim().length > 64) {
    errors.password = ["Password must be less than 64 characters."];
  }

  return errors;
}
