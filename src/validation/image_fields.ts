import { allNumbersValid } from "./user_fields";

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

export function checkImageDate(year: number, month: number, day: number) {
  let errors: string[] = [];

  // // Check if the values are numbers
  if (!allNumbersValid(year, month, day)) {
    errors.push("Year, month, and day must be numbers.");
  }

  if (year <= 1826 || year > 10000) {
    errors.push(
      "The first photo was in 1826, so year must be after that, within reason."
    );
  }

  if (month < 1 || month > 12) {
    errors.push("Month must be between 1 and 12.");
  }

  if (day < 1 || day > 31) {
    errors.push("Day must be between 1 and 31.");
  }

  // Create a Date object from the picture taken date
  const picTakenDate = new Date(year, month - 1, day);
  // Check if the date is valid
  if (isNaN(picTakenDate.getTime())) {
    errors.push("Date picture taken must be a valid date.");
  }

  // Create Date objects for today and the start date
  const today = new Date();
  const startDate = new Date(1801, 0, 1); // accounts for vintage pictures

  // Check if the picture taken date is before today and after the start date
  if (picTakenDate >= today || picTakenDate < startDate) {
    errors.push(
      `Date picture was taken must be between 1801 and ${new Date().getFullYear()}`
    );
  }

  // check of the picture takendate is a real date, eg., 2021-02-31 is not a valid date
  if (
    picTakenDate.getFullYear() !== year ||
    picTakenDate.getMonth() !== month - 1 ||
    picTakenDate.getDate() !== day
  ) {
    errors.push("Date picture was taken must be a valid date.");
  }

  if (errors.length > 0) {
    return { isValid: false, messages: errors };
  }

  return { isValid: true, messages: [] };
}
