import { Permission } from "../permissions";
import { Scope } from "../scopes";

export type User = {
  csrf?: string;

  id?: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  slug?: string;
  created_at?: string;
  enabled?: boolean;
  account_expired?: boolean;
  account_locked?: boolean;
  birth_month?: number;
  birth_day?: number;
  birth_year?: number;
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
