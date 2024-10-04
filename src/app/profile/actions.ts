"use server";

import { Profile, validateUpdateProfile } from ".";
import { ProfileActionCmd as ProfileActionCmd } from "."; // Assuming ProfileAction is defined in types.ts

export async function handleUserEdit(
  previousState: ProfileActionCmd,
  formData: FormData
) {
  const firstname = formData.get("firstname");
  const lastname = formData.get("lastname");

  const updated: Profile = {
    firstname: firstname as string,
    lastname: lastname as string,
  };

  // field validation
  const errors = validateUpdateProfile(updated);

  return { profile: updated, errors: errors } as ProfileActionCmd;
}
