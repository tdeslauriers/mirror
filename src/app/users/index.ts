import {
  checkCity,
  checkCountry,
  checkState,
  checkStreetAddress,
  checkZipCode,
} from "@/validation/address_fields";
import { Permission } from "../permissions";
import { Scope } from "../scopes";
import { ApiTimestamp } from "../api";
import {
  checkCountryCode,
  checkExtension,
  checkPhoneNumber,
} from "@/validation/phone_fields";

export type User = {
  csrf?: string;

  id?: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  nickname?: string;
  dark_mode?: boolean;
  slug?: string;
  created_at?: string;
  enabled?: boolean;
  account_expired?: boolean;
  account_locked?: boolean;
  birth_month?: number;
  birth_day?: number;
  birth_year?: number;
  addresses?: Address[] | null;
  phones?: Phone[] | null;
  scopes?: Scope[];
  permissions?: Permission[];
};

export type UserScopesCmd = {
  csrf?: string;
  user_slug?: string;
  scope_slugs: string[];
};

export type UserPermissionsCmd = {
  csrf?: string;
  entity_slug?: string;
  service_permissions: ServicePermission[];
};

export type ServicePermission = {
  service_name: string;
  permission_slug: string;
};

export type AddressActionCmd = {
  csrf?: string | null;
  slug?: string | null;
  username?: string | null;
  address?: Address | null;
  errors: { [key: string]: string[] };
};

export type AddressCmd = {
  csrf?: string | null;
  slug?: string;
  username?: string;
  address: Address;
};

export type Address = {
  id?: string;
  slug?: string;
  street_address?: string;
  street_address_2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  is_current?: boolean;
  is_primary?: boolean;
  updated_at?: ApiTimestamp;
  created_at?: ApiTimestamp;
};

export function validateAddress(address: Address) {
  const errors: { [key: string]: string[] } = {};

  // check street address
  const addressLine1Check = checkStreetAddress(
    address.street_address?.trim() ?? "",
  );
  if (!addressLine1Check.isValid) {
    errors.street_address = addressLine1Check.messages;
  }

  // check street address 2
  if (address.street_address_2 && address.street_address_2.trim().length > 0) {
    const addressLine2Check = checkStreetAddress(
      address.street_address_2.trim(),
    );
    if (!addressLine2Check.isValid) {
      errors.street_address_2 = addressLine2Check.messages;
    }
  }

  // check city
  if (address.city) {
    const cityCheck = checkCity(address.city.trim());
    if (!cityCheck.isValid) {
      errors.city = cityCheck.messages;
    }
  }

  // check state: includes check against list of states
  if (address.state_province) {
    const stateCheck = checkState(address.state_province.trim());
    if (!stateCheck.isValid) {
      errors.state = stateCheck.messages;
    }
  }

  // check postal code
  if (address.postal_code) {
    const zipCheck = checkZipCode(address.postal_code.trim());
    if (!zipCheck.isValid) {
      errors.zip_code = zipCheck.messages;
    }
  }

  // check country: includes check against list of countries
  if (address.country) {
    const countryCheck = checkCountry(address.country.trim());
    if (!countryCheck.isValid) {
      errors.country = countryCheck.messages;
    }
  }

  return errors;
}

export type PhoneActionCmd = {
  csrf?: string | null;
  slug?: string | null;
  username?: string;
  phone?: Phone | null;
  errors: { [key: string]: string[] };
};

export type PhoneCmd = {
  csrf?: string | null;
  slug?: string | null;
  username?: string;
  phone: Phone;
};

export const PhoneTypes: Map<number, string> = new Map([
  [0, "Unspecified"],
  [1, "Mobile"],
  [2, "Home"],
  [3, "Work"],
]);

export type Phone = {
  id?: string;
  slug?: string;
  country_code?: string;
  phone_number?: string;
  extension?: string;
  phone_type?: number;
  is_primary?: boolean;
  is_current?: boolean;
  updated_at?: ApiTimestamp;
  created_at?: ApiTimestamp;
};

export function validatePhone(phone: Phone) {
  const errors: { [key: string]: string[] } = {};

  // check country code
  const countryCodeCheck = checkCountryCode(phone.country_code?.trim() ?? "");
  if (!countryCodeCheck.isValid) {
    errors.country_code = countryCodeCheck.messages;
  }

  // check phone number
  const phoneNumberCheck = checkPhoneNumber(phone.phone_number?.trim() ?? "");
  if (!phoneNumberCheck.isValid) {
    errors.phone_number = phoneNumberCheck.messages;
  }

  // check extension if provided
  if (phone.extension && phone.extension.trim().length > 0) {
    const extensionCheck = checkExtension(phone.extension.trim());
    if (!extensionCheck.isValid) {
      errors.extension = extensionCheck.messages;
    }
  }

  // check phone type
  if (
    phone.phone_type !== undefined &&
    ![...PhoneTypes.keys()].includes(phone.phone_type)
  ) {
    errors.phone_type = [
      `Phone type must be one of the following: ${[...PhoneTypes.values()].join(", ")}.`,
    ];
  }

  return errors;
}
