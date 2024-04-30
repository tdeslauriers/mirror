import { stat } from "fs";
import { NextRequest, NextResponse } from "next/server";
import {
  FieldValidation,
  Registration,
  checkBirthdate,
  checkEmail,
  checkName,
  checkPassword,
} from "@/validation/profile";

export async function POST(req: Request) {
  const registration: Registration = await req.json();

  // field validation
  const errors = validateRegistration(registration);
  if (errors && Object.keys(errors).length > 0) {
    console.log("errors: ", errors);
    return new Response(JSON.stringify(errors), {
      status: 422,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // call registration endpoint
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  const apiResponse = await fetch("https://localhost:8443/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registration),
  });

  // handle registration errors
  if (!apiResponse.ok) {
    const data = await apiResponse.json();

    // check if the error is a gateway error
    if (!isGatewayError(data)) {
      return new Response(JSON.stringify({ server: ["An error occurred."] }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // handle different error scenarios
    const gatewayErrors = handleGatewayErrors(data);

    return new Response(JSON.stringify(gatewayErrors), {
      status: apiResponse.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // registration successful
  return new Response(JSON.stringify({ message: "Registration successful." }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
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
      errors.validation = [gatewayError.message];
      return errors;
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
