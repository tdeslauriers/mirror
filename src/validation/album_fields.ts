export const ALBUM_TITLE_MIN_LENGTH = 3;
export const ALBUM_TITLE_MAX_LENGTH = 32;
export const ALBUM_TITLE_REGEX: RegExp = /^[a-zA-Z0-9 ]+$/;

export const ALBUM_DESCRIPTION_MIN_LENGTH = 2;
export const ALBUM_DESCRIPTION_MAX_LENGTH = 255;
export const ALBUM_DESCRIPTION_REGEX: RegExp = /^[a-zA-Z0-9 ,.!?'"-]+$/;

// check title
export function checkAlbumTitle(title: string) {
  let errors: string[] = [];
  if (
    title.trim().length < ALBUM_TITLE_MIN_LENGTH ||
    title.trim().length > ALBUM_TITLE_MAX_LENGTH
  ) {
    errors.push(
      `Album title must be between ${ALBUM_TITLE_MIN_LENGTH} and ${ALBUM_TITLE_MAX_LENGTH} characters long.`
    );
  }

  if (!ALBUM_TITLE_REGEX.test(title)) {
    errors.push("Album title must be alphanumeric characters only.");
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}

// check description
export function checkAlbumDescription(description: string) {
  let errors: string[] = [];
  if (
    description.trim().length < ALBUM_DESCRIPTION_MIN_LENGTH ||
    description.trim().length > ALBUM_DESCRIPTION_MAX_LENGTH
  ) {
    errors.push(
      `Album description must be between ${ALBUM_DESCRIPTION_MIN_LENGTH} and ${ALBUM_DESCRIPTION_MAX_LENGTH} characters long.`
    );
  }

  if (!ALBUM_DESCRIPTION_REGEX.test(description)) {
    errors.push("Album description contains invalid characters.");
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}
