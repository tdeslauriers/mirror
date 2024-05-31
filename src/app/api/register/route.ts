import {
  FieldValidation,
  Registration,
  checkBirthdate,
  checkEmail,
  checkName,
  checkPassword,
} from "@/validation/fields";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const registration: Registration = await req.json();

  // field validation
  const errors = validateRegistration(registration);
  if (errors && Object.keys(errors).length > 0) {
    return new Response(JSON.stringify(errors), {
      status: 422,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // call gateway registration endpoint
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  try {
    const apiResponse = await fetch("https://localhost:8443/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registration),
    });

    if (apiResponse.ok) {
      const success = await apiResponse.json();
      return NextResponse.json(success, {
        status: apiResponse.status, // 201 expected
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      const fail = await apiResponse.json();
      if (isGatewayError(fail)) {
        const errors = handleGatewayErrors(fail);
        return NextResponse.json(errors, {
          status: apiResponse.status,
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
        throw new Error(
          "An error occurred. Please try again. If the problem persists, please contact me."
        );
      }
    }
  } catch (error: any) {
    return NextResponse.json(
      { server: [error.message] },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

export type GatewayError = {
  code: number;
  message: string;
};

function isGatewayError(object: any): object is GatewayError {
  return (
    object &&
    typeof object.code === "number" &&
    typeof object.message === "string"
  );
}

function handleGatewayErrors(gatewayError: GatewayError) {
  const errors: { [key: string]: string[] } = {};
  switch (gatewayError.code) {
    case 400:
      errors.badrequest = [gatewayError.message];
      return errors;
    case 409:
      errors.username = [gatewayError.message];
      return errors;
    case 422:
      // temporary fix for now: determine which error received
      switch (true) {
        case gatewayError.message.includes("username"):
          errors.username = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("password"):
          errors.password = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("firstname"):
          errors.firstname = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("lastname"):
          errors.lastname = [gatewayError.message];
          return errors;
        case gatewayError.message.includes("birthdate"):
          errors.birthdate = [gatewayError.message];
          return errors;
        default:
          break;
      }
    default:
      errors.server = [
        gatewayError.message || "An error occurred. Please try again.",
        "If the problem persists, please contact me.",
      ];
      return errors;
  }
}

function validateRegistration(registration: Registration) {
  const errors: { [key: string]: string[] } = {};

  // username
  if (registration.username.length === 0) {
    errors.username = ["Email/username address is required."];
  }

  if (registration.username.length > 0) {
    const usernameCheck: FieldValidation = checkEmail(registration.username);
    if (!usernameCheck.isValid) {
      errors.username = usernameCheck.messages;
    }
  }

  // password
  if (registration.password.length === 0) {
    errors.password = ["Password is required."];
  }

  if (registration.password.length > 0) {
    const passwordCheck: FieldValidation = checkPassword(registration.password);
    if (!passwordCheck.isValid) {
      errors.password = passwordCheck.messages;
    }
  }

  // confirm_password: check if matches password
  if (registration.confirm_password.length === 0) {
    errors.confirm_password = ["Confirm password is required."];
  }

  if (registration.confirm_password.length > 0) {
    if (registration.password !== registration.confirm_password) {
      errors.confirm_password = ["Passwords do not match."];
    }
  }

  // check firstname
  if (registration.firstname.length === 0) {
    errors.firstname = ["First name is required."];
  }

  if (registration.firstname.length > 0) {
    const firstnameCheck: FieldValidation = checkName(registration.firstname);
    if (!firstnameCheck.isValid) {
      errors.firstname = firstnameCheck.messages;
    }
  }

  // check lastname
  if (registration.lastname.length === 0) {
    errors.lastname = ["Last name is required."];
  }

  if (registration.lastname.length > 0) {
    const lastnameCheck: FieldValidation = checkName(registration.lastname);
    if (!lastnameCheck.isValid) {
      errors.lastname = lastnameCheck.messages;
    }
  }

  // check birthdate
  // check if all birthdate fields are filled out
  if (
    (registration.birthMonth &&
      (!registration.birthDay || !registration.birthYear)) ||
    (registration.birthDay &&
      (!registration.birthMonth || !registration.birthYear)) ||
    (registration.birthYear &&
      (!registration.birthMonth || !registration.birthDay))
  ) {
    errors.birthdate = [
      "Adding a birthdate is optionl, but if you add one, please fill out all dropdowns.",
    ];
    if (!registration.birthMonth) {
      errors.birthMonth.push("Month is required.");
    }
    if (!registration.birthDay) {
      errors.birthDay.push("Day is required.");
    }
    if (!registration.birthYear) {
      errors.birthYear.push("Year is required.");
    }
  }

  // only check if all birthdate fields are filled out
  if (
    registration.birthMonth &&
    registration.birthDay &&
    registration.birthYear
  ) {
    const birthdateCheck: FieldValidation = checkBirthdate(
      registration.birthYear,
      registration.birthMonth,
      registration.birthDay
    );
    if (!birthdateCheck.isValid) {
      errors.birthdate = birthdateCheck.messages;
    }
  }
  return errors;
}
