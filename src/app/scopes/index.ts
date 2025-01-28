export type Scope = {
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
    scope: Scope | null;
    errors: { [key: string]: string[] };
    };