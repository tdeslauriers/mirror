"use server";

interface Registration {
  username: string;
  password: string;
  confirm_password: string;
  firstname: string;
  lastname: string;
  birthdate?: string;
}

export async function handleRegister(prevFormData: any, formData: FormData) {
  const birthYear = formData.get("birthYear");
  const birthMonth = formData.get("birthMonth");
  const birthDay = formData.get("birthDay");

  const bday: string | undefined =
    birthYear && birthMonth && birthDay
      ? `${birthYear}-${birthMonth}-${birthDay}`
      : undefined;

  const registration: Registration = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
    confirm_password: formData.get("confirm_password") as string,
    firstname: formData.get("firstname") as string,
    lastname: formData.get("lastname") as string,
    birthdate: bday,
  };

  if (!registration.username.includes("@")) {
    return {
      message: "Invalid email address",
    };
  }

}
