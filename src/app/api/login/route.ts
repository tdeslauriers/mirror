import { Credentials, checkUuid } from "@/validation/fields";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // field validation
  const errors: { [key: string]: string[] } = {};

  // check oauth query params
  const parsedUrl = new URL(req.url);
  const state = parsedUrl.searchParams.get("state");
  if (!state || !checkUuid(state).isValid) {
    console.log("state url query param either missing or not well formed uuid");
    errors.oauth.push("State url query param must be a valid UUID.");
  }
  const nonce = parsedUrl.searchParams.get("nonce");
  if (!nonce || !checkUuid(nonce).isValid) {
    console.log("nonce url query param either missing or not well formed uuid");
    errors.oauth.push("Nonce url query param must be a valid UUID.");
  }
  // redirect check is simple because will be checked against registered redirect urls by auth service
  const redirect = parsedUrl.searchParams.get("redirect");
  if (!redirect || redirect.trim().length < 11) {
    console.log(
      "redirect url query param missing or too short for a valid url."
    );
    errors.oauth.push("Redirect url query param is missing or too short.");
  }

  // check credentials --> very light weight validation
  const credentials: Credentials = await req.json();
  if (credentials.username.trim().length > 254) {
    console.log("username less than 254 characters.");
    errors.username = ["Email/username must be less than 254 characters."];
  }
  if (credentials.password.trim().length > 64) {
    console.log("password less than 64 characters.");
    errors.password = ["Password must be less than 64 characters."];
  }

  // return field level errors to login page
  if (errors && Object.keys(errors).length > 0) {
    return NextResponse.json(errors, {
      status: 422,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // post to gateway login endpoint
}
