// query param constants
export const DEFAULT_MIN_QUERY_PARAM_LENGTH: number = 1;
export const DEFAULT_MAX_QUERY_PARAM_LENGTH: number = 100;
export const DEFAULT_QUERY_PARAM_REGEX: RegExp = /^[a-zA-Z0-9_]+$/;

export const DEFAULT_MIN_QUERY_PARAM_VALUE_LENGTH: number = 1;
export const DEFAULT_MAX_QUERY_PARAM_VALUE_LENGTH: number = 511; // 512 - 1 is the max length for a URL query param value
export const DEFAULT_QUERY_PARAM_VALUE_REGEX: RegExp = /^[a-zA-Z0-9@,_\- ]+$/;

// this will be used to validate query params passed to server components or the API gateway
export interface SafeSearchParamsOptions {
  allowedKeys: string[]; // Array of allowed query parameter keys
  requiredKeys?: string[];
  minKeyLength?: number;
  maxKeyLength?: number;
  minValueLength?: number;
  maxValueLength?: number;
  keyRegex?: RegExp;
  valueRegex?: RegExp; // general regex. Field specific regex's should be applied as well.
}

// this will be used to validate query params passed to server components or the API gateway
// it is lightweight and assumes additional field level validation is done specific to the object's fields
export function safeSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
  options: SafeSearchParamsOptions
) {
  // set the defaults
  const {
    allowedKeys,
    requiredKeys = [],
    minKeyLength = DEFAULT_MIN_QUERY_PARAM_LENGTH,
    maxKeyLength = DEFAULT_MAX_QUERY_PARAM_LENGTH,
    minValueLength = DEFAULT_MIN_QUERY_PARAM_VALUE_LENGTH,
    maxValueLength = DEFAULT_MAX_QUERY_PARAM_VALUE_LENGTH,
    keyRegex = DEFAULT_QUERY_PARAM_REGEX,
    valueRegex = DEFAULT_QUERY_PARAM_VALUE_REGEX,
  } = options;

  const sanitized: Record<string, string | string[]> = {};

  for (const [key, value] of Object.entries(searchParams)) {
    // check if the key is allowed
    if (!allowedKeys.includes(key)) {
      throw new Error(`Invalid query parameter: ${key}`);
    }

    // check if the key is required
    if (requiredKeys.includes(key) && !value) {
      throw new Error(`Missing required query parameter: ${key}`);
    }

    // check the key length
    if (key.length < minKeyLength || key.length > maxKeyLength) {
      throw new Error(
        `Query parameter key "${key}" must be between ${minKeyLength} and ${maxKeyLength} characters long.`
      );
    }

    // check the key regex
    if (!keyRegex.test(key)) {
      throw new Error(
        `Query parameter key "${key}" contains invalid characters.`
      );
    }

    // check if value is and array or string
    if (Array.isArray(value)) {
      const joined = value.join(",");

      if (joined.length > maxValueLength || joined.length < minValueLength) {
        throw new Error(
          `Query parameter "${key}" values must be between ${minValueLength} and ${maxValueLength} characters long`
        );
      }

      // check the value regex
      for (const val of value) {
        if (typeof val !== "string") {
          throw new Error(`Query parameter "${key}" value must be a string`);
        }

        if (!valueRegex.test(val)) {
          throw new Error(
            `Query parameter "${key}" value "${val}" contains invalid characters`
          );
        }
      }

      sanitized[key] = value;
    } else if (typeof value === "string") {
      if (value.length > maxValueLength || value.length < minValueLength) {
        throw new Error(
          `Query parameter "${key}" value must be between ${minValueLength} and ${maxValueLength} characters long`
        );
      }

      // check the value regex
      if (!valueRegex.test(value)) {
        throw new Error(
          `Query parameter "${key}" value "${value}" contains invalid characters`
        );
      }

      sanitized[key] = value;
    }
  }

  // check for required keys
  for (const key of requiredKeys) {
    if (!sanitized[key]) {
      throw new Error(`Missing required query parameter: ${key}`);
    }
  }

  return sanitized;
}

// prepareQueryParams is a utility function to prepare query params for the API gateway
// it takes an object of query params and returns a string of query params
// lib/prepareQueryParams.ts
export function prepareQueryParams(
  params: Record<string, string | string[]>
): Record<string, string> {
  const prepared: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      // join the array values into a string
      prepared[key] = value.join(",");
    } else {
      prepared[key] = value;
    }
  }

  return prepared;
}
