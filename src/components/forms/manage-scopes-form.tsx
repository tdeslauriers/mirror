"use client";

import { Scope } from "@/app/scopes";
import { EntityScopesActionCmd } from ".";
import ManageAccessForm, { AccessItem } from "./manage-access-form";

export default function ManageScopesForm({
  csrf,
  editAllowed,
  entitySlug,
  entityScopes,
  menuScopes,
  updateScopes,
}: {
  csrf?: string | null;
  editAllowed?: boolean; // just cookie check => ui rendering logic only
  entitySlug?: string | null;
  entityScopes: Scope[] | null;
  menuScopes: Scope[];
  updateScopes: (
    previousState: EntityScopesActionCmd,
    formData: FormData
  ) => EntityScopesActionCmd | Promise<EntityScopesActionCmd>;
}) {
  // convert Scopes to AccessItems to conform with the form
  const toAssignable = (s: Scope): AccessItem => ({
    id: s.scope_id,
    service_name: s.service_name,
    access: s.scope,
    name: s.name,
    description: s.description,
    created_at: s.created_at,
    active: s.active,
    slug: s.slug,
    link: `${s.slug}`,
  });
  return (
    <ManageAccessForm
      accessLabel="scope"
      csrf={csrf}
      editAllowed={editAllowed}
      entitySlug={entitySlug}
      entityAccessItems={entityScopes?.map(toAssignable) ?? []}
      menuAccessItems={menuScopes.map(toAssignable)}
      updateAccessItems={updateScopes}
    />
  );
}
