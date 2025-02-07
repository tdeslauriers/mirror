export type Scope = {
  csrf?: string;

  scope_id?: string;
  service_name?: string;
  scope?: string;
  name?: string;
  description?: string;
  created_at?: string;
  active?: boolean;
  slug?: string;
};

export type ScopeActionCmd = {
  csrf?: string;
  slug?: string | null;
  scope?: Scope | null;
  errors: { [key: string]: string[] };
};

export type ServiceClient = {
  csrf?: string;

  id?: string;
  name?: string;
  owner?: string;
  created_at?: string;
  enabled?: boolean;
  account_expired?: boolean;
  account_locked?: boolean;
  slug?: string;
  scopes?: Scope[];
};

export type ServiceClientActionCmd = {
  csrf?: string;
  slug?: string | null;
  serviceClient?: ServiceClient | null;
  errors: { [key: string]: string[] };
};
