import { Scope } from "@/components/forms";

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
};

export type UserScopesCmd = {
  csrf?: string;
  user_slug?: string;
  scope_slugs: string[];
};
