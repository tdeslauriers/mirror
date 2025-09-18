import { ReadonlyURLSearchParams } from "next/navigation";

export interface ShowMenu {
  [key: string]: boolean;
}

// List of allowed return URLs within the application to prevent open redirects
const AllowedReturnUrls = [
  "/profile",
  "/permissions",
  "/users",
  "/scopes",
  "/services",

  "/albums",
  "/images",

  "/allowances",
  "/templates",
  "/tasks",
];

function allowedPrefix(url: string): boolean {
  for (const allowed of AllowedReturnUrls) {
    if (url.startsWith(allowed)) {
      return true;
    }
  }
  return false;
}

export type ReturnParams = {
  returnUrl: string; // Safe return URL within the application
  returnDestination: string; // Safe return destination within the application
};

// Validates and extracts safe return parameters from the URL search parameters
// Ensures that the returnUrl starts with '/' and is of reasonable length to prevent open redirects
export function getSafeReturnParams(
  params: ReadonlyURLSearchParams,
  fallbackUrl: string = "/",
  backLabel: string = "home"
): ReturnParams {
  let url: string | null = null;
  let dest: string | null = null;

  // get the returnUrl or fallback
  const returnUrl = params.get("returnUrl");

  if (returnUrl && returnUrl.startsWith("/") && returnUrl.length < 2048) {
    if (allowedPrefix(returnUrl)) {
      url = returnUrl;
    } else {
      url = fallbackUrl;
    }
  } else {
    url = fallbackUrl;
  }

  // get the returnDestination or backLabel
  const returnDestination = params.get("returnDestination");
  if (
    returnDestination &&
    returnDestination.length > 0 &&
    returnDestination.length < 128
  ) {
    dest = returnDestination;
  } else {
    dest = backLabel;
  }

  return { returnUrl: url, returnDestination: dest } as ReturnParams;
}
