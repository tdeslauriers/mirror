import {
  checkAlbumDescription,
  checkAlbumTitle,
} from "@/validation/album_fields";
import { checkUuid } from "@/validation/user_fields";
import { GatewayError } from "../api";
import { ImageData } from "../images";

export type Album = {
  csrf?: string | null; // CSRF token for form submission
  id?: string;
  title?: string;
  description?: string;
  slug?: string;
  created_at?: string;
  updated_at?: string;
  is_archived?: boolean;
  blur_url?: string | null; // album cover photo: signed URL from gateway/object storage

  // slice of image thumbnails associated with the album: may not be present or may be empty
  images?: ImageData[];
};

export function validateAlbum(album: Album) {
  const errors: { [key: string]: string[] } = {};

  // check csrf
  if (album.csrf && album.csrf.trim().length > 0) {
    if (album.csrf.trim().length < 16 || album.csrf.trim().length > 64) {
      {
        errors.csrf = [
          "CSRF token is not well formed. Cannot edit or tamper with this value.",
        ];
      }
    }
  }

  // regex csrf check
  if (album.csrf && album.csrf.trim().length > 0) {
    const checkCsrf = checkUuid(album.csrf ?? "");
    if (!checkCsrf.isValid) {
      errors.csrf = errors.csrf ?? [];
      errors.csrf.push(...checkCsrf.messages);
    }
  }

  // validate title
  if (!album.title || album.title.trim().length === 0) {
    errors.title = ["Album title is required."];
  }
  const checkTitle = checkAlbumTitle(album.title ?? "");
  if (!checkTitle.isValid) {
    errors.title = errors.title ?? [];
    errors.title.push(...checkTitle.messages);
  }

  // validate description
  if (!album.description || album.description.trim().length === 0) {
    errors.description = ["Album description is required."];
  }
  const checkDescription = checkAlbumDescription(album.description ?? "");
  if (!checkDescription.isValid) {
    errors.description = errors.description ?? [];
    errors.description.push(...checkDescription.messages);
  }

  // validate slug
  if (
    album.slug &&
    (album.slug.trim().length < 16 || album.slug.trim().length > 64)
  ) {
    errors.slug = [
      "Album slug is required and must be between 16 and 64 characters long.",
    ];
  }

  // validate slug if it exists
  if (album.slug && album.slug.trim().length > 0) {
    // regex slug check
    const checkSlug = checkUuid(album.slug);
    if (!checkSlug.isValid) {
      errors.slug = errors.slug ?? [];
      errors.slug.push(...checkSlug.messages);
    }
  }

  return errors;
}

export type AlbumActionCmd = {
  csrf?: string | null; // CSRF token for form submission
  slug?: string | null; // Unique identifier for the album, used in URLs
  album?: Album; // The album data to be updated or created
  errors: { [key: string]: string[] }; // Validation errors, if any
};

export function handleAlbumErrors(gatewayError: GatewayError): {
  [key: string]: string[];
} {
  const errors: { [key: string]: string[] } = {};

  switch (gatewayError.code) {
    case 400:
      errors.server = [gatewayError.message];
      return errors;
    case 401:
      errors.server = [gatewayError.message];
      return errors;
    case 403:
      errors.server = [gatewayError.message];
      return errors;
    case 404:
      errors.server = [gatewayError.message];
      return errors;
    case 405:
      errors.server = [gatewayError.message];
      return errors;
    case 422:
      switch (true) {
        case gatewayError.message.includes("title"):
          errors.title = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("description"):
          errors.description = [gatewayError.message];
          return errors;

        default:
          break;
      }
    default:
      errors.server = ["Unhandled error calling the gateway service."];
      return errors;
  }
}
