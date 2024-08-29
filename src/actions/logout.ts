"use server";

import { LogoutCmd } from "./index";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { GatewayError, isGatewayError } from "@/app/api";

// logout strategy is to be absolute.  It will check for session, authenticated, and identity cookies.
// If a session value is found, it will be sent to the gateway to be destroyed.  If found, whether authenticated
// or not, the gateway will destroy the session.  If not found, the gateway will return an error for logging here.
// Once the gateway returns, the cookies will be removed from the client and the user will be redirected to login page.
export async function logout() {
  const cookieStore = cookies();
  const session: RequestCookie | undefined = cookieStore.get("session_id");

  if (session) {
    try {
      const cmd: LogoutCmd = {
        session: session.value,
      };

      // send session to gateway to remove
      const apiResponse = await fetch("https://localhost:8443/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cmd),
      });

      if (apiResponse.ok) {
        console.log("Session destroyed");
        // remove cookies: set values to blank and age to the past to prompt browser to delete it
        // on reload, client will request new anonymous session
        cookies().set("session_id", "", {
          httpOnly: true,
          sameSite: "strict",
          secure: true,
          maxAge: 0,
        });
        cookies().set("authenticated", "", {
          httpOnly: false,
          sameSite: "strict",
          secure: true,
          maxAge: 0,
        });
        cookies().set("identity", "", {
          httpOnly: false,
          sameSite: "strict",
          secure: true,
          maxAge: 0,
        });
      } else {
        // handle errors from gateway
        const fail = await apiResponse.json();
        if (isGatewayError(fail)) {
          const errors = handleLogoutErrors(fail);
          console.error(
            "Error destroying session: " + errors.server.join("; ")
          );
          return errors;
        } else {
          throw new Error(
            "An error occurred. Please try again. If the problem persists, please contact me."
          );
        }
      }
    } catch (error: any) {
      console.error("Logout api call failed: ", error);
      return { server: [error.message] };
    }

    // redirect to login page
    redirect("/login");
  } else {
    throw new Error("Session cookie not found.");
  }
}

// handle errors from gateway
function handleLogoutErrors(gatewayError: GatewayError) {
  const errors: { [key: string]: string[] } = {};
  errors.server = [
    gatewayError.message || "An error occurred. Please try again.",
    "If the problem persists, please contact me.",
  ];
  return errors;
}
