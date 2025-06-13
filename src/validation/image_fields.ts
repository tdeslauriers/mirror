export const IMAGE_TITLE_MIN_LENGTH = 3;
export const IMAGE_TITLE_MAX_LENGTH = 64;
export const IMAGE_TITLE_REGEX: RegExp = /^[a-zA-Z0-9 ]+$/;

export const IMAGE_DESCRIPTION_MIN_LENGTH = 2;
export const IMAGE_DESCRIPTION_MAX_LENGTH = 255;
export const IMAGE_DESCRIPTION_REGEX: RegExp = /^[a-zA-Z0-9 ,.!?'"-]+$/;

export const ALLOWED_IMAGE_FILE_TYPES: string[] = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

export const IMAGE_FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10 MB

export function checkImageTitle(title: string) {
  let errors: string[] = [];
  if (
    title.trim().length < IMAGE_TITLE_MIN_LENGTH ||
    title.trim().length > IMAGE_TITLE_MAX_LENGTH
  ) {
    errors.push(
      `Image title must be between ${IMAGE_TITLE_MIN_LENGTH} and ${IMAGE_TITLE_MAX_LENGTH} characters long.`
    );
  }

  if (!IMAGE_TITLE_REGEX.test(title)) {
    errors.push("Image title must be alphanumeric characters only.");
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}

export function checkImageDescription(description: string) {
  let errors: string[] = [];
  if (
    description.trim().length < IMAGE_DESCRIPTION_MIN_LENGTH ||
    description.trim().length > IMAGE_DESCRIPTION_MAX_LENGTH
  ) {
    errors.push(
      `Image description must be between ${IMAGE_DESCRIPTION_MIN_LENGTH} and ${IMAGE_DESCRIPTION_MAX_LENGTH} characters long.`
    );
  }

  if (!IMAGE_DESCRIPTION_REGEX.test(description)) {
    errors.push("Image description contains invalid characters.");
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}
