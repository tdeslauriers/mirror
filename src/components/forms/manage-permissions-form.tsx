"use client";

import { Permission } from "@/app/permissions";
import ManageAccessForm from "./manage-access-form";
import { EntityPermissionsActionCmd } from ".";

export default function ManagePermissionsForm({
  csrf,
  editAllowed,
  entitySlug,
  entityPermissions,
  menuPermissions,
  updatePermissions,
}: {
  csrf?: string | null;
  editAllowed?: boolean; // just cookie check => ui rendering logic only
  entitySlug?: string | null;
  entityPermissions: Permission[] | null;
  menuPermissions: Permission[];
  updatePermissions: (
    previousState: EntityPermissionsActionCmd,
    formData: FormData
  ) => EntityPermissionsActionCmd | Promise<EntityPermissionsActionCmd>;
}) {
  const toAssignable = (p: Permission) => ({
    id: p.uuid,
    service_name: p.service_name,
    access: p.permission,
    name: p.name,
    description: p.description,
    created_at: p.created_at,
    active: p.active,
    slug: p.slug,
    link: `${p.service_name}/${p.slug}`,
  });

  return (
    <ManageAccessForm
      accessLabel="permission"
      csrf={csrf}
      editAllowed={editAllowed}
      entitySlug={entitySlug}
      entityAccessItems={entityPermissions?.map(toAssignable) ?? []}
      menuAccessItems={menuPermissions?.map(toAssignable) ?? []}
      updateAccessItems={updatePermissions}
    />
  );
}
