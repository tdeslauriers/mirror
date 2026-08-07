// uuid regex
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// checks if a UUID is valid
export function checkUuid(uuid: string) {
  let errors: string[] = [];

  // regex test
  if (!UUID_REGEX.test(uuid)) {
    errors.push("Must be a valid UUID.");
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}

// common or shared fields
// often these are wrapper functions around common
// field types and values

// checks if csrf is valid/wellformed
export function checkCsrf(csrf: string) {
  let errors: string[] = [];

  const check = checkUuid(csrf);
  if (!check.isValid) {
    errors.push("CSRF is not well formed.");
    errors.push(...check.messages);

    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}

// checks if the slug is valid/wellformed
export function checkSlug(slug: string) {
  let errors: string[] = [];

  const check = checkUuid(slug);
  if (!check.isValid) {
    errors.push("Slug is not well formed.");
    errors.push(...check.messages);

    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}
